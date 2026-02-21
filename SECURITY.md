# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. Email the maintainers with a description of the vulnerability
2. Include steps to reproduce the issue
3. If possible, include a suggested fix or mitigation

### What to Expect

- **Acknowledgement** within 48 hours of your report
- **Assessment** within 5 business days
- **Fix timeline** communicated once the issue is assessed
- **Credit** given in the release notes (unless you prefer to remain anonymous)

### Scope

The following are in scope:
- Authentication and authorization bypass
- Cross-site scripting (XSS)
- Server-side request forgery (SSRF)
- Injection vulnerabilities (SQL, NoSQL, command)
- Sensitive data exposure
- Firestore security rules bypass
- API rate limiting bypass

### Out of Scope

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report these to the upstream project)
- Issues requiring physical access to a user's device
