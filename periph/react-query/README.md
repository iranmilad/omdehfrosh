# React Query Cache System

A comprehensive session-based caching system for React Query with fine-grained control, .env configuration, and Redux integration support.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Cache Strategies](#cache-strategies)
- [Hooks Reference](#hooks-reference)
  - [useApiQuery](#useapiquery)
  - [useApiMutation](#useapimutation)
  - [useFileUpload](#usefileupload)
  - [useCacheControl](#usecachecontrol)
- [Configuration](#configuration)
- [Endpoint Policies](#endpoint-policies)
- [Advanced Usage](#advanced-usage)
- [Integration with Redux](#integration-with-redux)
- [Best Practices](#best-practices)

---

## Installation

The system is already integrated into your project. Import from:

```javascript
import {
  useApiQuery,
  useApiMutation,
  useCacheControl,
  STALE_TIME,
  GC_TIME,
  CACHE_STRATEGY
} from '@/Libs/reactQuery';
```

---

## Quick Start

### Basic Query

```javascript
import { useApiQuery } from '@/Libs/reactQuery';

function ProductList() {
  const { data, isLoading, error } = useApiQuery({
    endpoint: '/products',
    queryKey: ['products'],
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <ProductGrid products={data} />;
}
```

### Critical Data (Always Fresh)

```javascript
const { data: cart } = useApiQuery({
  endpoint: '/cart',
  queryKey: ['cart'],
  critical: true, // Always fetches fresh data
});
```

### Mutation with Cache Invalidation

```javascript
const { mutate, isPending } = useApiMutation({
  endpoint: '/cart/add',
  method: 'post',
  invalidateKeys: [['cart']], // Invalidates cart cache on success
});

// Usage
mutate({ productId: 123, quantity: 1 });
```

---

## Cache Strategies

### Available Strategies

| Strategy | Stale Time | GC Time | Use Case |
|----------|------------|---------|----------|
| `CRITICAL` | 0 | 1 min | Cart, checkout, payment, real-time stock |
| `REAL_TIME` | 10 sec | 1 min | Notifications, messages, live updates |
| `DYNAMIC` | 30 sec | 5 min | Product lists, search results |
| `STANDARD` | 2 min | 5 min | Most API calls (default) |
| `CACHED` | 5 min | 15 min | Categories, brands, product details |
| `SESSION` | 30 min | 30 min | Bootstrap data, app config |
| `STATIC` | 1 hour | 1 hour | Countries, provinces, static data |
| `IMMUTABLE` | Infinity | 24 hours | Historical data, archived content |
| `USER_DATA` | 15 min | 30 min | User profile, addresses |
| `PAGINATED` | 2 min | 15 min | Infinite scroll, paginated lists |

### Using Strategies

```javascript
// Method 1: Use strategy name
const { data } = useApiQuery({
  endpoint: '/categories',
  queryKey: ['categories'],
  strategy: 'STATIC',
});

// Method 2: Use critical shorthand
const { data } = useApiQuery({
  endpoint: '/cart',
  queryKey: ['cart'],
  critical: true, // Same as strategy: 'CRITICAL'
});

// Method 3: Custom stale/gc times
const { data } = useApiQuery({
  endpoint: '/products',
  queryKey: ['products'],
  staleTime: STALE_TIME.LONG,  // 5 minutes
  gcTime: GC_TIME.SESSION,     // 30 minutes
});
```

---

## Hooks Reference

### useApiQuery

Main hook for data fetching with caching support.

```typescript
const result = useApiQuery({
  // Request Configuration
  endpoint: string,          // API endpoint (e.g., '/products')
  url?: string,              // Full URL (alternative to endpoint)
  queryKey: Array,           // React Query cache key
  method?: string,           // HTTP method (default: 'get')
  params?: object,           // URL query parameters
  body?: object,             // Request body
  headers?: object,          // Custom headers
  axiosConfig?: object,      // Additional axios config

  // Cache Strategy
  strategy?: string,         // Strategy name (default: 'STANDARD')
  critical?: boolean,        // Force fresh data (shorthand for CRITICAL)
  staleTime?: number,        // Custom stale time (overrides strategy)
  gcTime?: number,           // Custom gc time (overrides strategy)

  // Query Control
  enabled?: boolean,         // Enable/disable query (default: true)
  select?: Function,         // Transform response data
  keepPrevious?: boolean,    // Keep previous data while fetching

  // Metadata
  meta?: {
    showErrorNotification?: boolean,  // Show error toast (default: true)
  },
});

// Returns
result.data           // Query data
result.isLoading      // Initial loading state
result.isFetching     // Any fetching state
result.isError        // Error state
result.error          // Error object
result.refetch()      // Manual refetch function
result.isFresh        // Is data fresh (not stale)
result.getData(fallback)  // Get data with fallback
```

### Preset Query Hooks

```javascript
import {
  useCriticalQuery,   // For critical data
  useSessionQuery,    // For session-level data
  useStaticQuery,     // For static/reference data
  useUserDataQuery,   // For user-specific data
  useRealTimeQuery,   // For real-time data
} from '@/Libs/reactQuery';

// All accept same options as useApiQuery
const { data } = useCriticalQuery({
  endpoint: '/cart',
  queryKey: ['cart'],
});
```

### useApiMutation

Hook for data mutations with cache invalidation.

```typescript
const mutation = useApiMutation({
  // Request Configuration
  endpoint: string,
  url?: string,
  method?: string,           // 'post', 'put', 'patch', 'delete'
  params?: object,
  headers?: object,

  // Cache Management
  invalidateKeys?: Array,    // Query keys to invalidate on success
  removeKeys?: Array,        // Query keys to remove from cache
  optimisticUpdate?: {       // Optimistic update config
    queryKey: Array,
    updater: (oldData, variables) => newData,
  },

  // Callbacks
  onSuccess?: (data, variables, context) => void,
  onError?: (error, variables, context) => void,
  onSettled?: (data, error, variables, context) => void,

  // Metadata
  meta?: {
    showSuccessNotification?: boolean,
    successMessage?: string,
    showErrorNotification?: boolean,
  },
});

// Usage
mutation.mutate(data);           // Fire and forget
await mutation.mutateAsync(data); // With async/await
mutation.reset();                 // Reset mutation state
```

### Preset Mutation Hooks

```javascript
import { useCreate, useUpdate, useDelete } from '@/Libs/reactQuery';

// POST mutation
const { mutate: createProduct } = useCreate({
  endpoint: '/products',
  invalidateKeys: [['products']],
});

// PUT/PATCH mutation
const { mutate: updateProduct } = useUpdate({
  endpoint: '/products/123',
  method: 'patch', // or 'put'
  invalidateKeys: [['products']],
});

// DELETE mutation
const { mutate: deleteProduct } = useDelete({
  endpoint: '/products/123',
  invalidateKeys: [['products']],
});
```

### useFileUpload

File upload with progress tracking.

```javascript
const { mutate, progress, isUploading } = useFileUpload({
  endpoint: '/upload/image',
  invalidateKeys: [['images']],
  onProgress: (percent) => console.log(`${percent}%`),
});

// Usage
const formData = new FormData();
formData.append('file', file);
mutate(formData);

// In JSX
<ProgressBar value={progress} />
```

### useCacheControl

Manual cache control utilities.

```javascript
const cache = useCacheControl();

// Invalidation
cache.invalidate(['products']);              // Invalidate specific query
cache.invalidatePrefix('product');           // Invalidate by prefix
cache.invalidateMultiple([['cart'], ['user']]); // Invalidate multiple
cache.invalidateAll();                       // Invalidate everything

// Removal
cache.remove(['products']);                  // Remove from cache
cache.removePrefix('temp');                  // Remove by prefix
cache.clearAll();                            // Clear entire cache

// Data Access
const data = cache.getData(['products']);    // Get cached data
cache.setData(['products'], newData);        // Set cache manually
cache.updateData(['cart'], (old) => ({       // Update with function
  ...old,
  total: old.total + 1,
}));

// Prefetch
await cache.prefetch({
  queryKey: ['products'],
  endpoint: '/products',
  strategy: 'CACHED',
});

// Refetch
cache.refetch(['products']);                 // Refetch specific
cache.refetchActive();                       // Refetch all active

// Utilities
cache.isFetching(['products']);              // Check if fetching
cache.isStale(['products']);                 // Check if stale
cache.getStats();                            // Get cache statistics
```

### useInvalidatePatterns

Predefined invalidation helpers.

```javascript
const invalidate = useInvalidatePatterns();

invalidate.invalidateCart();
invalidate.invalidateProducts();
invalidate.invalidateUser();
invalidate.invalidateOrders();
invalidate.invalidateNotifications();
invalidate.invalidateCategories();
invalidate.invalidateBrands();
invalidate.invalidateBootstrap();
```

---

## Configuration

### Environment Variables

All cache settings can be configured via `.env`:

```env
# ============================================================================
# REACT QUERY CACHE CONFIGURATION
# ============================================================================

# Enable/Disable caching globally
REACT_APP_CACHE_ENABLED=true

# Debug mode (logs cache operations in console)
REACT_APP_CACHE_DEBUG=true

# Show error notifications globally
REACT_APP_CACHE_SHOW_ERROR_NOTIFICATIONS=true

# ============================================================================
# STALE TIME SETTINGS (in milliseconds)
# How long data is considered "fresh" before background refetch triggers
# ============================================================================
REACT_APP_CACHE_STALE_INSTANT=10000      # 10 seconds
REACT_APP_CACHE_STALE_SHORT=30000        # 30 seconds
REACT_APP_CACHE_STALE_MEDIUM=120000      # 2 minutes
REACT_APP_CACHE_STALE_LONG=300000        # 5 minutes
REACT_APP_CACHE_STALE_EXTENDED=900000    # 15 minutes
REACT_APP_CACHE_STALE_SESSION=1800000    # 30 minutes
REACT_APP_CACHE_STALE_STATIC=3600000     # 1 hour

# ============================================================================
# GARBAGE COLLECTION TIME SETTINGS (in milliseconds)
# How long inactive/unused data stays in memory before being removed
# ============================================================================
REACT_APP_CACHE_GC_SHORT=60000           # 1 minute
REACT_APP_CACHE_GC_MEDIUM=300000         # 5 minutes
REACT_APP_CACHE_GC_LONG=900000           # 15 minutes
REACT_APP_CACHE_GC_SESSION=1800000       # 30 minutes
REACT_APP_CACHE_GC_EXTENDED=3600000      # 1 hour
REACT_APP_CACHE_GC_PERSISTENT=86400000   # 24 hours

# ============================================================================
# RETRY SETTINGS
# ============================================================================
REACT_APP_CACHE_RETRY_MINIMAL=1
REACT_APP_CACHE_RETRY_STANDARD=2
REACT_APP_CACHE_RETRY_EXTENDED=3

# ============================================================================
# NETWORK SETTINGS
# ============================================================================
REACT_APP_CACHE_REFETCH_ON_FOCUS=false
REACT_APP_CACHE_REFETCH_ON_RECONNECT=true
REACT_APP_CACHE_REFETCH_INTERVAL=0
```

### Understanding Stale Time vs GC Time

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FETCH ──► FRESH ──────────────► STALE ──────────────► GARBAGE     │
│            │                      │                      │          │
│            │   staleTime          │      gcTime          │          │
│            │◄─────────────────────►◄─────────────────────►          │
│            │                      │                      │          │
│            │ Data returned        │ Data returned        │ Data     │
│            │ immediately          │ immediately +        │ removed  │
│            │ No refetch           │ background refetch   │ from     │
│            │                      │ triggered            │ memory   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

staleTime: How long before data is considered outdated
gcTime:    How long unused data stays in memory (garbage collection)
```

---

## Endpoint Policies

Endpoints are automatically assigned cache strategies based on patterns defined in `config.js`:

```javascript
// config.js - ENDPOINT_POLICIES

critical: [
  '/cart', '/cart/*',
  '/checkout', '/checkout/*',
  '/payment', '/payment/*',
  '/auth/user-initial-data',
],

realTime: [
  '/notifications', '/notifications/*',
  '/messages', '/messages/*',
],

static: [
  '/bootstrap',
  '/categories', '/categories/*',
  '/provinces',
  '/countries',
],

session: [
  '/auth/user-profile',
  '/user/preferences',
],

userData: [
  '/user/*',
  '/orders', '/orders/*',
  '/addresses', '/addresses/*',
  '/favorites', '/favorites/*',
],
```

You can extend these policies in `config.js` to fit your needs.

---

## Advanced Usage

### Optimistic Updates

```javascript
const { mutate } = useApiMutation({
  endpoint: '/cart/add',
  optimisticUpdate: {
    queryKey: ['cart'],
    updater: (oldCart, newItem) => ({
      ...oldCart,
      items: [...oldCart.items, { ...newItem, id: 'temp-id' }],
      total: oldCart.total + newItem.price,
    }),
  },
  invalidateKeys: [['cart']], // Refetch real data after mutation
});
```

### Infinite Queries (Pagination)

```javascript
import { useApiInfiniteQuery } from '@/Libs/reactQuery';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useApiInfiniteQuery({
  endpoint: '/products',
  queryKey: ['products', 'infinite'],
  params: { limit: 20 },
  getNextPageParam: (lastPage) => lastPage.nextPage,
  initialPageParam: 1,
});

// Flatten pages
const allProducts = data?.pages.flatMap(page => page.items) ?? [];
```

### Prefetching on Hover

```javascript
function ProductCard({ product }) {
  const cache = useCacheControl();

  const prefetchDetails = () => {
    cache.prefetch({
      queryKey: ['product', product.id],
      endpoint: `/products/${product.id}`,
      strategy: 'CACHED',
    });
  };

  return (
    <Link
      to={`/product/${product.id}`}
      onMouseEnter={prefetchDetails}
    >
      {product.name}
    </Link>
  );
}
```

### Conditional Queries

```javascript
const { data: user } = useApiQuery({
  endpoint: '/user',
  queryKey: ['user'],
  enabled: isLoggedIn, // Only fetch when logged in
});

const { data: orders } = useApiQuery({
  endpoint: `/users/${user?.id}/orders`,
  queryKey: ['orders', user?.id],
  enabled: !!user?.id, // Only fetch when user ID is available
});
```

### Batch Mutations

```javascript
import { useBatchMutation } from '@/Libs/reactQuery';

const { execute, isLoading, results } = useBatchMutation({
  mutations: [
    { endpoint: '/items/1', method: 'delete' },
    { endpoint: '/items/2', method: 'delete' },
    { endpoint: '/items/3', method: 'delete' },
  ],
  invalidateKeys: [['items']],
  onAllSuccess: () => toast.success('All items deleted'),
});

// Execute all mutations
await execute();
```

### Custom Response Transformer

```javascript
const { data } = useApiQuery({
  endpoint: '/products',
  queryKey: ['products'],
  transformer: (response) => {
    // Custom transformation
    return response.data.items.map(item => ({
      ...item,
      displayPrice: formatPrice(item.price),
    }));
  },
});
```

---

## Integration with Redux

The cache system works alongside Redux. Use React Query for **server state** and Redux for **client state**.

### Recommended Pattern

```javascript
// Redux: UI state, auth state, local preferences
const isModalOpen = useSelector(state => state.ui.isModalOpen);
const user = useSelector(state => state.auth.user);

// React Query: Server data
const { data: products } = useApiQuery({
  endpoint: '/products',
  queryKey: ['products'],
});

const { data: cart } = useApiQuery({
  endpoint: '/cart',
  queryKey: ['cart'],
  critical: true,
});
```

### Invalidate Cache from Redux Actions

```javascript
// In a Redux thunk or component
import { getQueryClient } from '@/Libs/reactQuery';

export const logoutUser = () => async (dispatch) => {
  // Clear auth state
  dispatch(clearAuth());

  // Clear all cached data
  const queryClient = getQueryClient();
  queryClient.clear();
};
```

### Sync React Query with Redux

```javascript
function useUserSync() {
  const dispatch = useDispatch();

  const { data: user } = useApiQuery({
    endpoint: '/auth/user',
    queryKey: ['user'],
    onSuccess: (userData) => {
      // Sync to Redux when user data changes
      dispatch(setUser(userData));
    },
  });

  return user;
}
```

---

## Best Practices

### 1. Query Key Design

```javascript
// Good - Hierarchical and specific
queryKey: ['products']
queryKey: ['products', { category: 'phones' }]
queryKey: ['products', productId]
queryKey: ['products', productId, 'reviews']

// Bad - Non-descriptive
queryKey: ['data']
queryKey: [1, 2, 3]
```

### 2. Choose the Right Strategy

| Data Type | Strategy | Example |
|-----------|----------|---------|
| Payment/Checkout | `CRITICAL` | Cart total, stock availability |
| Real-time updates | `REAL_TIME` | Notifications, chat messages |
| Lists with filters | `DYNAMIC` | Search results, filtered products |
| Reference data | `STATIC` | Countries, categories |
| User settings | `SESSION` | Preferences, profile |

### 3. Invalidate Smartly

```javascript
// Good - Specific invalidation
invalidateKeys: [['cart']]
invalidateKeys: [['products', productId]]

// Careful - May cause unnecessary refetches
invalidateKeys: [['products']] // Invalidates ALL product queries
```

### 4. Use Optimistic Updates for Better UX

```javascript
// Show immediate feedback, then sync with server
const { mutate } = useApiMutation({
  endpoint: '/favorites/add',
  optimisticUpdate: {
    queryKey: ['favorites'],
    updater: (old, newItem) => [...old, newItem],
  },
});
```

### 5. Handle Loading States

```javascript
const { data, isLoading, isFetching } = useApiQuery({...});

// isLoading: true only on initial load (no cached data)
// isFetching: true whenever fetching (including background refetch)

if (isLoading) return <Skeleton />;

return (
  <>
    {isFetching && <RefreshIndicator />}
    <ProductList products={data} />
  </>
);
```

---

## File Structure

```
src/Libs/reactQuery/
├── index.js              # Main exports
├── config.js             # Environment configuration
├── cacheStrategies.js    # Cache strategy definitions
├── queryClientFactory.js # QueryClient creation
├── cacheUtils.js         # Cache control utilities
├── hooks/
│   ├── useQuery.js       # Query hooks
│   └── useMutation.js    # Mutation hooks
└── README.md             # This documentation
```

---

## Troubleshooting

### Data not updating after mutation

```javascript
// Make sure to invalidate the correct query key
const { mutate } = useApiMutation({
  endpoint: '/products',
  invalidateKeys: [['products']], // Must match the queryKey used in useApiQuery
});
```

### Infinite refetching

```javascript
// Check if queryKey contains unstable references
// Bad - Creates new object on every render
queryKey: ['products', { filter: filters }]

// Good - Stable reference
const stableFilters = useMemo(() => filters, [filters.category, filters.sort]);
queryKey: ['products', stableFilters]
```

### Cache not working in development

Check `.env`:
```env
REACT_APP_CACHE_ENABLED=true
REACT_APP_CACHE_DEBUG=true  # See cache operations in console
```

### Need to force fresh data

```javascript
// Option 1: Use critical flag
critical: true

// Option 2: Manual refetch
const { refetch } = useApiQuery({...});
refetch();

// Option 3: Invalidate cache
const cache = useCacheControl();
cache.invalidate(['products']);
```

---

## API Reference Summary

| Hook | Purpose |
|------|---------|
| `useApiQuery` | Fetch data with caching |
| `useApiInfiniteQuery` | Paginated/infinite data |
| `useCriticalQuery` | Always-fresh data |
| `useSessionQuery` | Session-level cached data |
| `useStaticQuery` | Long-term cached data |
| `useApiMutation` | Create/Update/Delete operations |
| `useFileUpload` | File uploads with progress |
| `useCacheControl` | Manual cache management |
| `useInvalidatePatterns` | Predefined invalidation helpers |

---

## Version History

- **1.0.0** - Initial release with comprehensive caching system
