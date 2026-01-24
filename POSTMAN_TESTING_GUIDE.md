# Postman Testing Guide for Universal Payment Routes

## Base URL
```
http://localhost:5000/api/universal-payment
```

## Authentication
Both routes require a Bearer token in the Authorization header. You need to get a valid JWT token from your login endpoint first.

---

## Route 1: Get Payment Link

### Endpoint
```
POST http://localhost:5000/api/universal-payment/get-payment-link
```

### Headers
| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer YOUR_JWT_TOKEN_HERE` |

### Test Case 1: Wallet Payment (Recharge)

**Request Body (raw JSON):**
```json
{
  "amount": "100000",
  "geteway": "melli"
}
```

**Expected Response (200 OK):**
```json
{
  "link": "http://localhost:3000/fake-gateway",
  "body": {
    "transactionId": "uuid-here",
    "user_id": 1,
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```

**Notes:**
- `amount` must be a string (as specified in requirements)
- `geteway` can be any gateway name (e.g., "melli", "mellat", "saman", "fake")
- No `wallet_id` needed - backend gets it from the token's `user_id`
- No `phoneNumber` accepted

---

### Test Case 2: Order Payment

**Request Body (raw JSON):**
```json
{
  "order_id": "order_12345678-abcd-1234-abcd-123456789012",
  "geteway": "melli"
}
```

**Expected Response (200 OK):**
```json
{
  "link": "http://localhost:3000/fake-gateway",
  "body": {
    "transactionId": "uuid-here",
    "user_id": 1,
    "amount": "274499010",
    "redirect_url": "http://localhost:3000/payment-listener",
    "order_id": "order_12345678-abcd-1234-abcd-123456789012"
  }
}
```

**Notes:**
- `order_id` must exist in the database for the authenticated user
- Backend calculates amount from the order's `total_price` minus `total_discount`
- Order must belong to the user from the token

---

### Error Cases

**Missing Gateway (400 Bad Request):**
```json
{
  "amount": "100000"
}
```
**Response:**
```json
{
  "message": "Gateway is required"
}
```

**Invalid Request (400 Bad Request):**
```json
{
  "geteway": "melli"
}
```
**Response:**
```json
{
  "message": "Invalid request. For wallet: {amount, geteway}. For order: {order_id, geteway}"
}
```

**Unauthorized (403 Forbidden):**
Missing or invalid token
```json
{
  "message": "Unauthorized"
}
```

**Order Not Found (404 Not Found):**
```json
{
  "order_id": "non-existent-order-id",
  "geteway": "melli"
}
```
**Response:**
```json
{
  "message": "Order not found"
}
```

---

## Route 2: Verify Payment

### Endpoint
```
POST http://localhost:5000/api/universal-payment/verify-payment
```

### Headers
| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer YOUR_JWT_TOKEN_HERE` (optional, but recommended) |

### Test Case 1: Verify Wallet Payment (Success)

**Request Body (raw JSON):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=true",
  "body": {
    "transactionId": "uuid-from-get-payment-link-response",
    "user_id": 1,
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "link": "/account/wallet",
  "message": "آقای سجاد پرداخت شما با شماره تراکنش uuid-here موفق بوده است."
}
```

**Notes:**
- `link` should be the full URL with query params (simulating bank redirect)
- `body.transactionId` must exist in the Transaction collection
- `success=true` in the link URL indicates successful payment
- Backend finds wallet account by `user_id` from the body

---

### Test Case 2: Verify Order Payment (Success)

**Request Body (raw JSON):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=true",
  "body": {
    "transactionId": "uuid-from-get-payment-link-response",
    "user_id": 1,
    "amount": "274499010",
    "redirect_url": "http://localhost:3000/payment-listener",
    "order_id": "order_12345678-abcd-1234-abcd-123456789012"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "link": "/account/orders",
  "message": "آقای سجاد پرداخت شما با شماره تراکنش uuid-here موفق بوده است."
}
```

**Notes:**
- `order_id` in body indicates it's an order payment
- Backend updates order items and main order status to "paid"
- Updates `isPaid` and `status` fields

---

### Test Case 3: Verify Payment (Failed)

**Request Body (raw JSON):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=false",
  "body": {
    "transactionId": "uuid-from-get-payment-link-response",
    "user_id": 1,
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "link": "/account/wallet",
  "message": "پرداخت شما با شماره تراکنش uuid-here ناموفق بود. لطفا مجددا تلاش کنید."
}
```

**Notes:**
- `success=false` in the link URL indicates failed payment
- Transaction status is set to "failed"
- No wallet or order updates are performed

---

### Error Cases

**Missing Link or Body (400 Bad Request):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=true"
}
```
**Response:**
```json
{
  "link": "/",
  "message": "Link and body are required"
}
```

**Transaction Not Found (404 Not Found):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=true",
  "body": {
    "transactionId": "non-existent-transaction-id",
    "user_id": 1,
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```
**Response:**
```json
{
  "link": "/",
  "message": "تراکنش یافت نشد."
}
```

**Wallet Not Found (404 Not Found):**
```json
{
  "link": "http://localhost:3000/payment-listener?tried1234567&success=true",
  "body": {
    "transactionId": "valid-transaction-id",
    "user_id": 999,  // User without wallet account
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```
**Response:**
```json
{
  "link": "/account/wallet",
  "message": "کیف پول یافت نشد."
}
```

---

## Complete Testing Flow

### Step-by-Step Testing:

1. **Get a JWT Token** (from your login endpoint)
   ```
   POST http://localhost:5000/api/auth/login
   ```

2. **Create Payment Link** (choose one):
   - **Wallet:** `POST /get-payment-link` with `{ "amount": "100000", "geteway": "melli" }`
   - **Order:** `POST /get-payment-link` with `{ "order_id": "order_xxx", "geteway": "melli" }`
   
3. **Copy the `transactionId` and `body` from the response**

4. **Verify Payment**:
   ```
   POST /verify-payment
   {
     "link": "http://localhost:3000/payment-listener?tried1234567&success=true",
     "body": { /* body from step 2 */ }
   }
   ```

---

## Postman Collection Setup

### Environment Variables (Optional but Recommended)
Create a Postman environment with:
- `base_url`: `http://localhost:5000`
- `token`: `YOUR_JWT_TOKEN` (updated after login)
- `transaction_id`: (updated after get-payment-link)
- `payment_body`: (updated after get-payment-link)

### Pre-request Script (for automatic token)
```javascript
// Get token from environment
const token = pm.environment.get("token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

### Tests Script (to save transaction_id)
```javascript
// For get-payment-link response
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.body && response.body.transactionId) {
        pm.environment.set("transaction_id", response.body.transactionId);
        pm.environment.set("payment_body", JSON.stringify(response.body));
    }
}
```

---

## Quick Test Body Templates

### Wallet Payment Template
```json
{
  "amount": "100000",
  "geteway": "melli"
}
```

### Order Payment Template
```json
{
  "order_id": "order_12345678-abcd-1234-abcd-123456789012",
  "geteway": "melli"
}
```

### Verify Payment Template
```json
{
  "link": "http://localhost:3000/payment-listener?tried{{$randomInt}}&success=true",
  "body": {
    "transactionId": "{{transaction_id}}",
    "user_id": 1,
    "amount": "100000",
    "redirect_url": "http://localhost:3000/payment-listener"
  }
}
```

---

## Important Notes

1. **Token Required**: Both endpoints require a valid JWT token in the Authorization header
2. **Amount Format**: Amount must be sent as a string (not number) for wallet payments
3. **Transaction ID**: Must be a valid UUID that exists in the Transaction collection
4. **User Context**: The user_id from the token must match the order owner or wallet owner
5. **Success Parameter**: The `link` in verify-payment must contain `success=true` or `success=false` as a query parameter

---

## Troubleshooting

**403 Unauthorized**: 
- Check if token is valid and not expired
- Ensure token is sent in format: `Bearer YOUR_TOKEN`

**400 Bad Request**: 
- Check JSON syntax
- Ensure required fields are present
- Check field types (amount as string for wallet)

**404 Not Found**:
- For order: Ensure order exists and belongs to the user
- For verify: Ensure transactionId exists in database

**500 Internal Server Error**:
- Check backend console logs
- Ensure database connection is active
- Verify all required models are imported correctly

