# TODO - Fix Google & GitHub OAuth Authorization

## Step 1: Identify failure point
- [x] Checked backend OAuth routes exist (`server/routes/auth.js`).
- [x] Checked frontend route exists (`/auth/callback` -> `OAuthCallbackPage`).
- [ ] Diagnose remaining auth failure causes (likely token verification / wrong token value or baseURL issue).

## Step 2: Implement fix
- [ ] Ensure OAuth callback redirect returns token and frontend verifies it against the correct backend route.
- [ ] Fix axios baseURL / token verification so `loginWithToken()` calls the correct endpoint.

## Step 3: Test
- [ ] Run backend + frontend locally and validate OAuth login for both providers.
- [ ] Confirm `/dashboard` redirect works post OAuth.

