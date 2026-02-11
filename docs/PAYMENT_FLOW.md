# Payment Flow

**This same 4-API flow is used for all payment types:** wallet recharge, order with COD, order with wallet, order with Melli/Mellat/any gateway. No exceptions.

## Universal payment API (namings)

- `POST {{baseUrl}}/universal-payment/get-payment-link`
- `POST {{baseUrl}}/universal-payment/verify-payment`

## Other routes

- `POST /api/fakegateway` – receives POST from frontend, forwards POST to payment-listener, then redirects user to React listener page
- `POST /api/payment-listener` – receives POST body, processes payment, redirects to React listener page with token

## Flow (all payments: wallet, COD, Melli, Mellat, etc.)

1. User hits **پرداخت** (pay) on frontend.
2. Frontend calls **POST** `get-payment-link` → gets `{ link, body }`.
3. Frontend redirects user with **form POST** to **link** with **body** (link = `BACKEND_BASE_URL/api/fakegateway`).
4. **Fakegateway API** receives POST body, then sends **POST** to **payment-listener** (same backend) with that body.
5. **Payment-listener** receives POST, processes payment (runVerifyLogic), stores result by `transactionId`, then redirects to: `FRONTEND_BASE_URL/payment-listener/?transactionId=XXX&success=true` (or `success=false`).
6. **React listener page** reads `transactionId` and `success` from URL, calls **POST** `{{baseUrl}}/api/universal-payment/verify-payment` with body `{ transactionId, success }`, gets `{ message, link }`.
7. Message is displayed; user is redirected to **link** after 3 seconds (e.g. `/payment`, `/account/orders`, `/account/wallet`).

**Note:** `link` is `/payment` when there are unpaid orders in OrderJ2B (`isPaid: "unpaid"`) so the user can resume paying other orders.

---

## API details

### POST `{{baseUrl}}/universal-payment/get-payment-link`

- Used for **all** payment types: wallet recharge, order (COD, wallet, Melli, Mellat, etc.).
- **Request:** `{ order_id?, amount?, gateway }` — wallet: `{ amount, gateway }`; order: `{ order_id, gateway }`.
- **Response:** `{ link, body }`. `link` is always `BACKEND_BASE_URL/api/fakegateway`; user is form-POSTed there, then fakegateway POSTs to payment-listener.

### POST `/api/fakegateway`

- **Receives:** POST body (same as from frontend form).
- **Does:** Forwards POST to `BACKEND_BASE_URL/api/payment-listener` with that body; payment-listener returns 302 to React listener; fakegateway returns that same 302 to the user.

### POST `/api/payment-listener`

- **Receives:** Full POST body (from fakegateway or bank gateway; includes `transactionId`).
- **Does:** Processes payment (runVerifyLogic), stores result by `transactionId`, responds with **302** to `FRONTEND_BASE_URL/payment-listener/?transactionId=XXX&success=true|false`.

### POST `{{baseUrl}}/api/universal-payment/verify-payment`

- **Modes:**
  1. Body `{ transactionId, success? }` → returns stored `{ message, link }` and clears store (used by React payment-listener page).
  2. Body `{ link, body }` → runs verification, returns `{ message, link }` (legacy / bank callback).

---

## Env (backend)

- `BACKEND_BASE_URL` – e.g. `http://localhost:5000` or `https://api.j2b.market`
- `FRONTEND_BASE_URL` – e.g. `http://localhost:3001` or `https://j2b.market`
- `GATEWAY_URL` – (optional) production bank gateway URL
