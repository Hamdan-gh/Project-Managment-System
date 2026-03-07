# Bugfix Requirements Document

## Introduction

The application is experiencing 404 errors when accessing authentication endpoints in production. The frontend makes requests to `/api/auth/me` and other `/api/auth/*` endpoints, but these requests fail with 404 errors despite the routes being properly registered in the Express server. The bug occurs because the catch-all route handler (`app.get('*', ...)`) in server.js is positioned after the static file middleware but intercepts API requests before they can reach the API route handlers. This routing order issue causes all `/api/*` requests to be treated as frontend routes in production, resulting in 404 responses.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a request is made to `/api/auth/me` in production THEN the system returns a 404 error instead of the user data

1.2 WHEN a request is made to any `/api/auth/*` endpoint in production THEN the system returns a 404 error instead of processing the authentication request

1.3 WHEN the catch-all route handler processes an API request THEN the system attempts to serve index.html or returns "API endpoint not found" instead of allowing the API route handlers to process the request

### Expected Behavior (Correct)

2.1 WHEN a request is made to `/api/auth/me` in production THEN the system SHALL return the authenticated user's data with a 200 status code

2.2 WHEN a request is made to any `/api/auth/*` endpoint in production THEN the system SHALL route the request to the appropriate authentication handler and return the correct response

2.3 WHEN the server receives an API request THEN the system SHALL process it through the registered API route handlers before considering the catch-all route handler

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a request is made to a non-API route (e.g., `/`, `/dashboard`, `/proposals`) THEN the system SHALL CONTINUE TO serve the React application's index.html file

3.2 WHEN a request is made to `/api/test` THEN the system SHALL CONTINUE TO return the test response with status 200

3.3 WHEN a request is made to an invalid API endpoint (e.g., `/api/nonexistent`) THEN the system SHALL CONTINUE TO return a 404 error with the message "API endpoint not found"

3.4 WHEN the application runs in development mode with Vite's proxy THEN the system SHALL CONTINUE TO work correctly with all API endpoints accessible

3.5 WHEN static files are requested from `/uploads/*` THEN the system SHALL CONTINUE TO serve the uploaded files correctly
