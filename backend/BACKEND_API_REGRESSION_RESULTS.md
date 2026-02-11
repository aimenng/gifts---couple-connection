# Backend API Regression Results

Date: 2026-02-11  
Runner: `backend/scripts/runBackendRegression.ps1`  
Target: latest backend code on temporary `http://localhost:8788/api`  
Raw output: `backend/tmp_regression_results.json`

## Summary
- Auto pass: `T01 T02a T02b T02c T03 T04a T04b T04c T05 T09a T09b`
- N/A in current test environment: `T08a T08b T08c` (fake mailboxes + preset account, no real OTP flow)
- Optional/inconclusive: `T10` (timing test affected by warm-up/cooldown)
- Flaky timeout in full run, then rechecked and passed: `T06 T07a T07b`

## Full Run Table

| ID | Result | Status | Notes |
|---|---|---:|---|
| T01 | PASS | 200 | Health check ok |
| T02a | PASS | 200 | Existing email register-code request returned generic message |
| T02b | PASS | 200 | Non-existing email register-code request returned same generic message |
| T02c | PASS | 429 | Cooldown behavior works |
| T03 | PASS | 400 | Register verify with wrong code rejected |
| T04a | PASS | 200 | Existing email reset-code request returned generic message |
| T04b | PASS | 200 | Non-existing email reset-code request returned same generic message |
| T04c | PASS | 429 | Cooldown behavior works |
| T05 | PASS | 400 | Password reset with wrong code rejected |
| T06 | FAIL (flaky) | 0 | Timeout in this full run; rechecked separately and passed with 401 |
| T07a | FAIL (flaky) | 0 | Timeout in this full run; rechecked separately and passed with 200+token |
| T07b | FAIL (cascade) | - | Skipped because T07a timed out in this full run |
| T08a | N/A | - | Current environment has no real mailbox OTP delivery |
| T08b | N/A | - | Depends on T08a |
| T08c | N/A | - | Depends on T08a |
| T09a | PASS | 400 | Memories validation (`rotation` invalid) works |
| T09b | PASS | 400 | Events validation (`date` invalid) works |
| T10 | INCONCLUSIVE | 200 | Optional timing check not stable in this environment |

## Targeted Recheck (Flaky Cases)

Executed on fresh temporary backend instance (`:8788`) in isolated run:

- `T06` login wrong credentials: **401 PASS**
- `T07a` login success: **200 PASS**
- `T07b` `/auth/me` with token: **200 PASS**
- `T09a` memories invalid payload: **400 PASS**
- `T09b` events invalid payload: **400 PASS**

## Notes

1. `T08` is formally marked `N/A` for this environment because mailbox OTP cannot be delivered/verified.
2. `T10` is optional and timing-sensitive; startup warm-up, previous cooldown state, and external mail path can skew latency.
3. Core hardening checks are validated by status code behavior:
   - generic response for existing/non-existing accounts (`T02`, `T04`)
   - cooldown enforcement (`T02c`, `T04c`)
   - wrong-code rejection (`T03`, `T05`)
   - stricter input validation (`T09`)
4. Temporary test email records in database are intentionally retained (no cleanup performed).
