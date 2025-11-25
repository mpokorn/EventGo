# EventGo Follow-up Code Review

## Backend
- **Load environment variables before importing modules that require them.** `JWT_SECRET` is read during module import, but `dotenv.config()` runs afterward, so deployments without pre-set env vars will crash before the server starts. Move `dotenv.config()` ahead of imports (or guard the secret lookup) to prevent early failures.【F:backend/index.js†L1-L15】【F:backend/utils/auth.js†L4-L25】
- **Add centralized error handling and 404 fallback middleware.** The server mounts routers and starts listening without any `app.use((err, req, res, next) => ...)` handler or a catch-all route, which makes diagnostics harder and can leak stack traces. Introduce structured error responses and logging before `app.listen()`.【F:backend/index.js†L17-L44】
- **Harden HTTP security defaults.** No middleware for headers/rate limiting/logging is configured; adding `helmet`, `morgan`/`pino-http`, and request-rate limiting will improve security and observability with minimal code changes.【F:backend/index.js†L17-L25】【F:backend/index.js†L39-L44】
- **Remove hardcoded network addresses from logs.** The startup banner includes a fixed LAN IP (`192.168.1.201`), which is misleading in containerized/cloud deployments; derive it dynamically or drop the line.【F:backend/index.js†L39-L44】

## Frontend
- **Replace inline styles with design-system classes.** Organizer analytics cards and progress bars still embed inline `background` and sizing styles, bypassing the shared CSS and complicating theme changes. Move these values into CSS modules or utility classes and rely on custom properties for variants.【F:frontend/src/pages/organizer/OrganizerAnalytics.jsx†L82-L166】
- **Strengthen auth session handling.** `requireAuth` only checks for a stored user and redirects without preserving the intended destination or validating token freshness beyond the initial load. Add a redirect parameter and a lightweight token-expiry check before actions to avoid silent failures when storage is stale.【F:frontend/src/context/AuthContext.jsx†L12-L81】

## Potential Enhancements
- **Health and readiness endpoints.** Add `/healthz`/`/readyz` routes that verify database connectivity to aid deployment probes and monitoring.【F:backend/index.js†L20-L35】
- **Structured analytics API caching.** Organizer analytics call two endpoints on every render; consider memoization or API-side caching to cut duplicate queries when navigating between organizer pages.【F:frontend/src/pages/organizer/OrganizerAnalytics.jsx†L20-L36】【F:frontend/src/pages/organizer/OrganizerAnalytics.jsx†L73-L196】
- **Documentation refresh.** Align the existing `CODE_REVIEW_REPORT.md` with the above findings and clarify current priorities so new contributors know which issues remain open.【F:CODE_REVIEW_REPORT.md†L1-L120】
