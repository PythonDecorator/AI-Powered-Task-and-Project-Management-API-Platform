---
name: frontend-http
description: HTTP request helpers and TanStack React Query patterns for OneUp AI frontend. Read before making any API call. Covers authorizedRequest, unAuthorizedRequest, apiUrls, useQuery, useMutation, token management, and route protection.
when_to_use: Use when fetching data, submitting forms, calling the API, setting up useQuery or useMutation, managing tokens, or protecting routes. Use when asked about caching, staleTime, query invalidation, or 401 handling.
paths: frontend/**
---

# Frontend HTTP & Data Fetching

Reads use `useQuery`, writes use `useMutation`. Server data lives in the TanStack cache, not in `useState`. URLs always come from `apiUrls.js`.

## File locations
```
frontend/src/utils/helpers/
  http.js       axios instance · request functions · interceptors · queryClient
  apiUrls.js    all endpoint paths
  auth.js       token management · route loaders
```

## Request functions

### `authorizedRequest()` — protected endpoints
```javascript
import { authorizedRequest } from '@/utils/helpers/http';
import { departmentsUrl } from '@/utils/helpers/apiUrls';

// In useQuery:
queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal })

// In useMutation:
mutationFn: (formData) => authorizedRequest({ url: createDepartmentUrl, method: 'POST', payload: formData })
```

### `unAuthorizedRequest()` — public endpoints (login, register, password reset)
Same API as `authorizedRequest`, but does not attach a Bearer token. Use for any endpoint that does not require authentication.

### Parameters
| Param | Type | Notes |
|-------|------|-------|
| `url` | string | Import from `apiUrls.js` |
| `method` | string | `'GET'` (default), `'POST'`, `'PATCH'`, `'DELETE'` |
| `payload` | object | Request body for POST/PATCH/DELETE |
| `signal` | AbortSignal | Always pass from `queryFn({ signal })` — prevents memory leaks |
| `searchTerm` | string | Added as `?search=...` |
| `page` | number | Pagination |
| `ordering` | string | e.g. `'-created_at'` (leading `-` = descending) |
| `status`, `role`, `is_active` | any | Filter params — added to query string |

## useQuery patterns

### Basic read
```javascript
import { useQuery } from '@tanstack/react-query';
import { authorizedRequest } from '@/utils/helpers/http';
import { departmentsUrl } from '@/utils/helpers/apiUrls';

const { data, isPending, isError, error } = useQuery({
  queryKey: [departmentsUrl],
  queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal }),
  staleTime: 5 * 60 * 1000,   // 5 min — project standard
});

if (isPending) return <Loading />;
if (isError) return <ErrorMessage message={error?.message} />;
```

### Read with filters / pagination
```javascript
const { data } = useQuery({
  queryKey: [departmentsUrl, page, search, ordering],   // include ALL dynamic params
  queryFn: ({ signal }) => authorizedRequest({
    url: departmentsUrl,
    signal,
    page,
    searchTerm: search,
    ordering,
  }),
  staleTime: 5 * 60 * 1000,
});
```

## useMutation patterns

### Create (POST)
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authorizedRequest } from '@/utils/helpers/http';
import { createDepartmentUrl, departmentsUrl } from '@/utils/helpers/apiUrls';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (formData) => authorizedRequest({
    url: createDepartmentUrl,
    method: 'POST',
    payload: formData,
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [departmentsUrl] });
    onClose?.();
  },
});

// Wire to form:
<GeneralForm onSubmit={(data) => mutation.mutate(data)}
             buttonText={mutation.isPending ? 'Creating...' : 'Create'} />
```

### Update (PATCH)
```javascript
const mutation = useMutation({
  mutationFn: (formData) => authorizedRequest({
    url: updateDepartmentUrl(id),
    method: 'PATCH',
    payload: formData,
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [departmentsUrl] });
    queryClient.invalidateQueries({ queryKey: [getDepartmentUrl(id)] });
  },
});
```

### Delete
```javascript
const mutation = useMutation({
  mutationFn: () => authorizedRequest({ url: deleteDepartmentUrl(id), method: 'DELETE' }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: [departmentsUrl] }),
});
```

**Always use `mutation.mutate()` (fire-and-forget). Only use `mutateAsync()` if you need to `await` the result in a `try/catch` — and if you do, always wrap it.**

## API URLs (apiUrls.js)

```javascript
// Auth
loginUrl, logoutUrl, refreshTokenUrl, getCurrentUserUrl

// Departments
departmentsUrl
getDepartmentUrl(id)      // '/department/{id}/'
createDepartmentUrl
updateDepartmentUrl(id)
deleteDepartmentUrl(id)

// Members
membersUrl
getMemberUrl(id)
createMemberUrl
updateMemberUrl(id)
deleteMemberUrl(id)
reactivateMemberUrl(id)

// Projects
projectsUrl
getProjectUrl(id)
createProjectUrl
updateProjectUrl(id)
deleteProjectUrl(id)
```

Pattern: always use the function form for ID-based URLs (`getDepartmentUrl(id)`), never string-concatenate.

## Token management (auth.js)

```javascript
import { getAuthToken, setTokens, clearAuth, isTokenValid } from '@/utils/helpers/auth';

setTokens(accessToken, refreshToken);   // after login
clearAuth();                             // on logout
isTokenValid();                          // boolean check
```

**Token refresh is automatic.** When a request returns 401, the axios interceptor refreshes the access token and retries. If refresh fails, it clears auth and redirects to login. No manual handling needed.

Token storage: `js-cookie` with `Secure: true`, `SameSite: Strict`. Tokens are accessible to JavaScript (not HttpOnly) — be aware of XSS risk.

## Route protection

```javascript
import { protectedAuthLoader, checkAuthLoader } from '@/utils/helpers/auth';

{ path: '/',          element: <SignInSide />, loader: checkAuthLoader }     // redirect to dashboard if logged in
{ path: '/dashboard', element: <Dashboard />, loader: protectedAuthLoader }  // redirect to / if not logged in
```

## Common mistakes

```javascript
// ❌ Hardcoded URL
queryFn: () => authorizedRequest({ url: '/api/v1/department/' })

// ✅ Imported URL
queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal })

// ❌ Missing signal
queryFn: () => authorizedRequest({ url: departmentsUrl })

// ✅ Signal passed
queryFn: ({ signal }) => authorizedRequest({ url: departmentsUrl, signal })

// ❌ Direct async call — bypasses TanStack cache
const handleSubmit = async (data) => { await authorizedRequest({ ... }) }

// ✅ useMutation
const mutation = useMutation({ mutationFn: (data) => authorizedRequest({ ... }) })
<GeneralForm onSubmit={(data) => mutation.mutate(data)} />
```
