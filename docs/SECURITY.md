# VentureLens — Security, Privacy & Compliance Architecture

**Version:** 2.0.0  
**Status:** Approved Security Specification  
**Author:** Lead Software Architect & Senior AI Engineer  

---

## 1. Security Philosophy & Threat Model

VentureLens processes external web data, executes LLM prompts, and handles financial data. The architecture enforces security through a tiered model, separating **MVP Core Security Requirements** from **Later Hardening Steps**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              VentureLens Security Strategy                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ MVP CORE:                                                                              │
│ • Pre-flight DNS SSRF Blocking (Prohibits private/loopback/cloud-metadata IPs)        │
│ • Indirect Prompt Injection Defense (<untrusted_scraped_content> XML + JSON Schemas)   │
│ • Zero-Leakage Secrets Architecture (Environment variables via pydantic-settings)      │
│ • Strict Pydantic v2 Request Input Validation & Timeout Caps                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 2 & 3 HARDENING:                                                                 │
│ • Distributed Redis sliding-window rate limiter                                        │
│ • Dedicated scraping egress proxy pool & WAF integration                               │
│ • Role-Based Access Control (RBAC) & Enterprise SSO                                    │
│ • Automated CVE dependency auditing in CI (Trivy / Dependabot)                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. MVP Core Security Implementation

### 2.1 SSRF Defense (Pre-Flight DNS Resolution)
Before opening an HTTP connection to any user-requested or search-discovered URL, the backend crawler resolves the host IP address:
```python
# Conceptual SSRF Pre-flight Validator (backend/app/core/security.py)
BLOCKED_IP_NETWORKS = [
    ip_network("127.0.0.0/8"),      # Loopback
    ip_network("10.0.0.0/8"),       # Private RFC 1918
    ip_network("172.16.0.0/12"),    # Private RFC 1918
    ip_network("192.168.0.0/16"),   # Private RFC 1918
    ip_network("169.254.0.0/16"),   # Link-Local & Cloud Metadata (169.254.169.254)
    ip_network("::1"),              # IPv6 Loopback
    ip_network("fe80::/10"),        # IPv6 Link-Local
]

def validate_url_safety(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise SecurityException("Invalid URL protocol")
    
    ip = socket.gethostbyname(parsed.hostname)
    ip_obj = ip_address(ip)
    for blocked_net in BLOCKED_IP_NETWORKS:
        if ip_obj in blocked_net:
            raise SecurityException(f"SSRF Attempt Blocked: {ip} is private/reserved")
    return True
```
- **Fetch Constraints:** 8-second connect/read timeout, 2MB max payload cap, max 3 redirects.

### 2.2 Indirect Prompt Injection Defense
- **XML Tag Encapsulation:** Raw scraped HTML/markdown text is strictly wrapped in `<untrusted_scraped_content id="...">` blocks before inclusion in extraction prompts.
- **System Instruction Boundaries:** System instructions explicitly specify that content inside `<untrusted_scraped_content>` tags is untrusted external data to be analyzed, never instructions to be followed.
- **Structured Schema Enclosure:** All extractions use Gemini `response_schema` (Pydantic models), ensuring the model cannot produce arbitrary conversational instructions.

### 2.3 Secrets Isolation
- Application secrets (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `DATABASE_URL`) are loaded strictly on the server via `pydantic-settings`.
- No API key is ever bundled into frontend Next.js client bundles (`NEXT_PUBLIC_` prefix is strictly prohibited for backend secrets).

---

## 3. Phase 2 & 3 Hardening Roadmap

1. **Distributed Rate Limiting:** Redis-backed sliding window rate limiter per API key and client IP to prevent denial-of-wallet / scraper exhaustion attacks.
2. **Dedicated Scraping Proxy Pool:** Routing web requests through rotating egress proxies to avoid IP blacklisting and prevent source network disclosure.
3. **Enterprise Authentication:** NextAuth / JWT authentication with Role-Based Access Control (`ANALYST`, `PARTNER`, `ADMIN`).
4. **Automated Vulnerability Auditing:** GitHub Actions workflow running Trivy container vulnerability scans and `pip-audit` dependency checks on every PR.
