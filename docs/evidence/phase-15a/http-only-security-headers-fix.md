# HTTP-only AWS Security Headers Fix

2026-05-18T20:40:27+03:00

## Branch
fix/http-only-aws-security-headers

## Reason
The raw HTTP EC2 baseline loaded index.html but browser CSP upgraded JS/CSS asset requests to HTTPS, causing a blank page.

## Fix
Security headers are now controlled by ENABLE_HTTPS.

- ENABLE_HTTPS=false: raw HTTP baseline, no upgrade-insecure-requests and no HSTS.
- ENABLE_HTTPS=true: future HTTPS/TLS deployment can enable HTTPS security headers.

## Local health check
{"ok":true,"service":"lfcs-study-dashboard","status":"healthy"}

## Local readiness check
{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}

## Local root headers
HTTP/1.1 200 OK
X-Request-Id: 6be93058-2bef-45d5-9615-e99e29ddc88d
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline'
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Access-Control-Allow-Credentials: true
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Sun, 17 May 2026 21:35:49 GMT
ETag: W/"195-19e37dde308"
Content-Type: text/html; charset=UTF-8
Content-Length: 405
Date: Mon, 18 May 2026 17:40:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5


## Header assertions
PASS: no upgrade-insecure-requests on HTTP baseline
PASS: no HSTS on HTTP baseline
