# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - API Requests Intercepted by Catch-All Handler
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - API requests to registered routes (e.g., `/api/auth/me`, `/api/auth/login`, `/api/auth/register`) in production environment with dist folder present
  - Test that API requests to registered routes reach their handlers and return correct responses (not 404 from catch-all)
  - The test assertions should verify: response status is not 404 OR response body is not "API endpoint not found"
  - Run test on UNFIXED code with dist folder present
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "GET /api/auth/me returns 404 'API endpoint not found' instead of user data")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Frontend Routing and Static File Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (frontend routes, static files, invalid API routes)
  - Observe: GET `/` serves index.html on unfixed code
  - Observe: GET `/dashboard` serves index.html on unfixed code
  - Observe: GET `/uploads/test.jpg` serves static file on unfixed code
  - Observe: GET `/api/nonexistent` returns 404 "API endpoint not found" on unfixed code
  - Observe: GET `/api/test` returns test response with 200 status on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for API requests returning 404 due to catch-all handler interception

  - [ ] 3.1 Implement the fix
    - Locate the catch-all route handler `app.get('*', ...)` in server/server.js
    - Move the catch-all handler to the end of the middleware stack
    - Ensure the final order is: API route handlers → static file middleware → catch-all handler (LAST)
    - Verify no logic changes are needed in the catch-all handler itself
    - _Bug_Condition: isBugCondition(input) where input.path starts with '/api/' AND distFolderExists() AND catchAllHandlerPositionedAfterStaticMiddleware()_
    - _Expected_Behavior: API requests reach their registered handlers and return correct responses (not 404 from catch-all)_
    - _Preservation: Frontend routes serve index.html, static files are served correctly, invalid API routes return 404, test endpoint returns 200_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - API Requests Reach Handlers
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Frontend Routing and Static File Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
