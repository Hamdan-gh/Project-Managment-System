# API Auth 404 Fix - Bugfix Design

## Overview

The bug occurs because the catch-all route handler (`app.get('*', ...)`) in server.js is positioned after the static file middleware but before the request can be properly routed to API handlers. In production, when the dist folder exists, the static file middleware attempts to serve files, and if no static file matches, the catch-all handler intercepts the request. The catch-all handler checks if the path starts with `/api/` and returns a 404 JSON response, but this happens before Express can match the request against the registered API route handlers (`app.use("/api/auth", authRoutes)`). The fix involves reordering the middleware stack so that API route handlers are evaluated before the catch-all handler, ensuring API requests reach their intended handlers.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when API requests are made in production and the catch-all route handler intercepts them before they reach the API route handlers
- **Property (P)**: The desired behavior when API requests are made - they should be routed to the appropriate API handlers and return correct responses
- **Preservation**: Existing frontend routing behavior (serving index.html for non-API routes) and static file serving that must remain unchanged by the fix
- **Catch-all route handler**: The `app.get('*', ...)` handler in server.js that serves index.html for frontend routes
- **Middleware stack order**: The sequence in which Express evaluates middleware and route handlers - earlier handlers are evaluated first
- **Static file middleware**: The `express.static()` middleware that serves built frontend files from the dist folder

## Bug Details

### Fault Condition

The bug manifests when an API request is made in production where the dist folder exists. The Express middleware stack evaluates handlers in order: static file middleware attempts to serve a file, fails to find a match, then the catch-all handler intercepts the request and returns a 404 JSON response before the API route handlers registered earlier in the code can be evaluated.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type HTTPRequest
  OUTPUT: boolean
  
  RETURN input.path STARTS_WITH '/api/'
         AND distFolderExists()
         AND catchAllHandlerPositionedAfterStaticMiddleware()
         AND NOT apiRouteHandlerEvaluated(input.path)
END FUNCTION
```

### Examples

- **Request to `/api/auth/me`**: Expected to return user data with 200 status, but actually returns `{"msg": "API endpoint not found"}` with 404 status
- **Request to `/api/auth/login`**: Expected to process login and return JWT token, but actually returns `{"msg": "API endpoint not found"}` with 404 status
- **Request to `/api/auth/register`**: Expected to create new user account, but actually returns `{"msg": "API endpoint not found"}` with 404 status
- **Edge case - Request to `/api/nonexistent`**: Expected to return 404 (no handler exists), and correctly returns `{"msg": "API endpoint not found"}` with 404 status

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Frontend routes (e.g., `/`, `/dashboard`, `/proposals`) must continue to serve index.html
- Static file serving from `/uploads/*` must continue to work correctly
- The `/api/test` endpoint must continue to return test response with 200 status
- Invalid API endpoints (e.g., `/api/nonexistent`) must continue to return 404 with "API endpoint not found" message
- Development mode with Vite's proxy must continue to work correctly

**Scope:**
All inputs that do NOT involve valid API routes (routes registered with `app.use("/api/...")`) should be completely unaffected by this fix. This includes:
- Frontend navigation requests (non-API paths)
- Static file requests (CSS, JS, images from dist folder)
- Upload file requests (`/uploads/*`)
- Invalid API endpoint requests (API paths with no registered handler)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Middleware Evaluation Order**: Express evaluates middleware and route handlers in the order they are registered. The current order is:
   - API route handlers registered with `app.use("/api/auth", authRoutes)` etc.
   - Static file middleware with `app.use(express.static(distPath))`
   - Catch-all handler with `app.get('*', ...)`

2. **Static Middleware Behavior**: When `express.static()` receives a request, it attempts to find a matching file. If no file is found, it calls `next()` to pass control to the next middleware, which is the catch-all handler.

3. **Catch-all Handler Interception**: The catch-all handler uses `app.get('*', ...)` which matches ALL GET requests. When it receives an API request, it checks if the path starts with `/api/` and returns a 404 JSON response. However, this happens AFTER the static middleware has already passed control forward, preventing the request from being matched against the API route handlers registered earlier.

4. **Route Handler Registration vs. Matching**: Although API route handlers are registered before the static middleware in the code, Express's routing logic means that after the static middleware calls `next()`, the catch-all handler (`app.get('*', ...)`) matches before Express re-evaluates the API route handlers. This is because the catch-all handler is a route handler (not middleware) that matches the current request pattern.

## Correctness Properties

Property 1: Fault Condition - API Requests Reach Handlers

_For any_ HTTP request where the path starts with `/api/` and a corresponding route handler is registered (e.g., `/api/auth/*`, `/api/proposals/*`), the fixed server SHALL route the request to the appropriate API handler, which SHALL process the request and return the correct response (not a 404 from the catch-all handler).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Frontend Routing Behavior

_For any_ HTTP request where the path does NOT start with `/api/` (frontend routes like `/`, `/dashboard`, `/proposals`), the fixed server SHALL produce exactly the same behavior as the original server, serving index.html for valid frontend routes and maintaining all existing static file serving functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

The root cause is the middleware stack order. The fix requires moving the catch-all route handler to be the LAST handler in the middleware stack, after all API route handlers have been registered.

**File**: `server/server.js`

**Function**: N/A (middleware stack configuration)

**Specific Changes**:
1. **Keep API route handlers in current position**: The API route handlers (`app.use("/api/auth", authRoutes)` etc.) should remain registered early in the middleware stack, before static file serving.

2. **Keep static file middleware in current position**: The `app.use(express.static(distPath))` middleware should remain after API route handlers.

3. **Move catch-all handler to end**: The `app.get('*', ...)` handler must be moved to the very end of the middleware stack, after all API route handlers and static file middleware. This ensures:
   - API requests are matched against API route handlers first
   - Static file requests are served by the static middleware
   - Only unmatched requests (frontend routes) reach the catch-all handler

4. **No logic changes needed**: The catch-all handler's logic (checking for `/api/` prefix and serving index.html) can remain unchanged, as it will only be reached for requests that haven't been handled by earlier middleware.

5. **Verify order**: The final middleware stack order should be:
   - CORS and body parsing middleware
   - API route handlers (`/api/auth`, `/api/proposals`, etc.)
   - Static file middleware (`/uploads`, dist folder)
   - Catch-all handler (`app.get('*', ...)`) - LAST

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by making API requests in a production-like environment, then verify the fix works correctly and preserves existing frontend routing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the catch-all handler intercepts API requests in production when the dist folder exists.

**Test Plan**: Set up a production-like environment with the dist folder present, make requests to various `/api/auth/*` endpoints, and observe that they return 404 errors from the catch-all handler instead of being processed by the API route handlers. Run these tests on the UNFIXED code to confirm the root cause.

**Test Cases**:
1. **Auth Me Endpoint Test**: Make GET request to `/api/auth/me` with valid JWT token (will fail on unfixed code with 404)
2. **Auth Login Test**: Make POST request to `/api/auth/login` with credentials (will fail on unfixed code with 404)
3. **Auth Register Test**: Make POST request to `/api/auth/register` with user data (will fail on unfixed code with 404)
4. **Other API Routes Test**: Make requests to `/api/proposals`, `/api/messages` (will fail on unfixed code with 404)
5. **Test Endpoint Verification**: Make GET request to `/api/test` (should work on unfixed code as it's registered before catch-all)

**Expected Counterexamples**:
- API requests to `/api/auth/*` return `{"msg": "API endpoint not found"}` with 404 status
- Console logs show requests reaching the catch-all handler instead of API route handlers
- Possible causes: middleware stack order, static middleware calling next(), catch-all handler matching before API handlers

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (API requests to registered routes), the fixed server produces the expected behavior (routes to API handlers).

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition(request) DO
  response := server_fixed.handle(request)
  ASSERT response.statusCode != 404 OR response.body != "API endpoint not found"
  ASSERT response.handledBy == "API route handler"
  ASSERT expectedBehavior(response)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (frontend routes, static files, invalid API routes), the fixed server produces the same result as the original server.

**Pseudocode:**
```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT server_original.handle(request) = server_fixed.handle(request)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (various frontend routes, static file paths)
- It catches edge cases that manual unit tests might miss (unusual route patterns, query parameters)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for frontend routes and static files, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Frontend Route Preservation**: Observe that requests to `/`, `/dashboard`, `/proposals` serve index.html on unfixed code, verify this continues after fix
2. **Static File Preservation**: Observe that requests to `/uploads/*` serve files correctly on unfixed code, verify this continues after fix
3. **Invalid API Route Preservation**: Observe that requests to `/api/nonexistent` return 404 on unfixed code, verify this continues after fix
4. **Test Endpoint Preservation**: Observe that `/api/test` returns test response on unfixed code, verify this continues after fix

### Unit Tests

- Test that `/api/auth/me` returns user data with 200 status (not 404)
- Test that `/api/auth/login` processes login and returns JWT token
- Test that `/api/auth/register` creates user account
- Test that frontend routes (`/`, `/dashboard`) serve index.html
- Test that invalid API routes return 404 with "API endpoint not found"
- Test that static files from `/uploads/*` are served correctly

### Property-Based Tests

- Generate random valid API paths and verify they reach API handlers (not catch-all)
- Generate random frontend paths and verify they serve index.html
- Generate random static file paths and verify they are served correctly
- Test that all non-API requests continue to work across many scenarios

### Integration Tests

- Test full authentication flow: register, login, access protected route
- Test frontend navigation with various routes
- Test file upload and retrieval from `/uploads/*`
- Test that switching between API requests and frontend navigation works correctly
- Test production deployment scenario with dist folder present
