# best-shop — Architecture

Backend API for an e-commerce shop. This document describes the system as it exists
today: **authentication** (register, login, logout, me) and **admin-only product
creation**.

> For working conventions, gotchas, and the pre-flight checklist, see
> [`../AGENTS.md`](../AGENTS.md).

## 1. Purpose & scope

| In scope today | Planned |
|---|---|
| `POST /api/v1/auth/register` | Orders + payments |
| `POST /api/v1/auth/login` | Password reset + email delivery |
| `POST /api/v1/auth/logout` | Token revocation (refresh tokens / `tokenVersion`) |
| `GET /api/v1/auth/me` (JWT protected) | CORS for a non-localhost frontend |
| `POST /api/v1/products` (JWT + **admin** protected) | Image uploads (URLs are stored today) |
| `PUT\|PATCH /api/v1/products/:id` (JWT + **admin** protected) | Product slugs |
| `GET /api/v1/products` — paginated, search, filter, sort | |
| `GET /api/v1/products/:id`, `/category/:id` (public) | |
| `/api/v1/categories` CRUD (admin writes, public reads) | |
| `/api/v1/cart` — read / add / update / remove / clear (JWT protected) | |
| Input validation, layered errors, password hashing | |
| httpOnly JWT cookie (set on register/login, cleared on logout) | |

## 2. Tech stack

| Package | Version | Role |
|---|---|---|
| `express` | 5.3 | HTTP server, router, middleware pipeline |
| `mongoose` | 9.11 | ODM over MongoDB |
| `express-validator` | 7.3 | Declarative request validation |
| `bcryptjs` | 3.0 | Password hashing (pure JS, no native build) |
| `dotenv` | 18.0 | Loads `.env` into `process.env` |
| `nodemon` | 3.1 | Dev auto-restart (dev dependency) |

Runtime: **Node 22**, **ESM** (`"type": "module"` — use `import`/`export`, never `require`).
Package manager: **pnpm 12.14**.

## 3. System diagram

```
   Client (frontend)
        │  JSON: { name, email, password }
        ▼
┌───────────────────────────────────────────────┐
│  Express app — server.js                      │
│  express.json({ limit: "1mb" })               │
│  express.urlencoded({ extended: true })       │
└───────────────────┬───────────────────────────┘
                    ▼
┌───────────────────────────────────────────────┐
│  Routers                                      │
│  routes/user.route.js      → /api/v1/auth     │
│  routes/product.route.js   → /api/v1/products │
│    protectMiddleware → restrictTo("admin")    │
│  routes/category.route.js  → /api/v1/categories│
│  routes/cart.route.js      → /api/v1/cart     │
│    protectMiddleware on every route           │
│  routes/order.route.js     → /api/v1/orders   │
│    protectMiddleware; admin list/status       │
└───────────────────┬───────────────────────────┘
                    ▼
╔═══════════════════════════════════════════════╗
║  LAYER 1 · VALIDATION                         ║
║  validators/auth.validator.js                 ║
║    registerRules / loginRules                 ║
║  validators/product.validator.js              ║
║    productRules / updateProductRules          ║
║  validators/category.validator.js             ║
║  validators/cart.validator.js                 ║
║    addCartItemRules / updateCartItemRules     ║
║  validators/order.validator.js                ║
║    createOrderRules / updateOrderStatusRules  ║
║  middleware/validate.js                       ║
║    → 422 + per-field errors, request stops    ║
╚═══════════════════╤═══════════════════════════╝
                    │  valid payload only
                    ▼
╔═══════════════════════════════════════════════╗
║  LAYER 2 · BUSINESS LOGIC                     ║
║  controllers/user.controller.js               ║
║  controllers/product.controller.js            ║
║  controllers/category.controller.js           ║
║  controllers/cart.controller.js               ║
║  controllers/order.controller.js              ║
║    matchedData() → only validated fields      ║
║    throws AppError(message, statusCode)       ║
╚═══════════════════╤═══════════════════════════╝
                    ▼
╔═══════════════════════════════════════════════╗
║  LAYER 3 · PERSISTENCE                        ║
║  models/User.model.js                         ║
║    pre("save") → bcrypt hash (cost 10)        ║
║    pre("save") → sha256 reset token           ║
║  models/Product.model.js                      ║
║  models/Category.model.js                     ║
║  models/Cart.model.js                         ║
║  models/Order.model.js                        ║
╚═══════════════════╤═══════════════════════════╝
                    ▼
┌───────────────────────────────────────────────┐
│  MongoDB Atlas — cluster0.kjfbhkh / best-shop-db│
└───────────────────┬───────────────────────────┘
                    ▼
              200 / 201 JSON
```

**The layering rule:** each layer may only call the layer below it, and each layer owns
exactly one concern. A validator never touches the database; a controller never validates;
a model never inspects `req`.

## 4. Layer responsibilities

| Layer | Owns | Must never |
|---|---|---|
| `validators/` | Field rules + messages + sanitizers | Touch the DB or business logic |
| `middleware/validate.js` | Formatting validation errors into a 422 | Perform business checks |
| `middleware/protectMiddleware.js` | Verifying the JWT and loading `req.user` | Decide what a role may do |
| `middleware/restrictTo.js` | Role gate (`restrictTo("admin")`) | Query the DB or shape responses |
| `controllers/` | Business logic, orchestration, response shape | Validate input, catch errors |
| `models/` | Schema, persistence, hashing hooks | Read `req` or shape HTTP responses |
| `middleware/errorMiddleware.js` | Mapping any thrown error → HTTP status | Contain business logic |

### Why controllers have no try/catch

Express 5 forwards a rejected promise from an `async` handler to the error middleware
automatically. A `try/catch` in a controller would intercept the error and prevent the
status-code mapping from ever running — the exact bug that made every failure return 500.

## 5. Error flow

```
  controller throws AppError("User already exists", 409)
        │
        ▼
  ┌──────────────────────────────────────────┐
  │  errorMiddleware.js                      │
  │                                          │
  │  mongoose.ValidationError ──→ 400        │
  │  mongoose.CastError        ──→ 400       │
  │  error.code === 11000      ──→ 409       │
  │  AppError                  ─→ own code   │
  │  anything else             ──→ 500       │
  │                                          │
  │  5xx is logged; 4xx is not               │
  └──────────────────┬───────────────────────┘
                     ▼
  { "success": false, "message": "...", "stack": null-in-production }
```

## 6. Data model — `User`

| Field | Type | Rules | Notes |
|---|---|---|---|
| `name` | String | required, trim, 2–50 chars | |
| `email` | String | required, **unique**, lowercase, trim | Unique index; case-insensitive |
| `password` | String | required, 8–72 chars, `select: false` | bcrypt hashed on save |
| `profileImage` | String | default `""` | URL of the uploaded image |
| `isActive` | Boolean | default `true` | |
| `role` | String | enum `["user","admin"]`, default `"user"` | |
| `resetPasswordToken` | String | `select: false` | Only the sha256 hash is stored |
| `resetPasswordExpires` | String | `select: false` | 15-minute window |
| `createdAt` / `updatedAt` | Date | `timestamps: true` | Automatic |
| `id` | virtual | `toJSON`/`toObject` `virtuals: true` | Derived from `_id` |

### Hooks & methods

| Type | Name | Behaviour |
|---|---|---|
| `pre("save")` | hash password | Runs **only** when `isModified("password")`, so editing a name doesn't re-hash. Cost factor 10. |
| `pre("save")` | hash reset token | sha256 of the raw token before it is persisted. |
| method | `comparePassword(candidate)` | `bcrypt.compare` against the stored hash. |
| method | `getResetPasswordToken()` | Generates a random raw token, stores its hash + a 15-minute expiry, **returns the raw token** for delivery by email. |

> `pre("save")` uses Mongoose 9's promise signature — `async function () {}` with **no `next`
> callback**.

## 6b. Data model — `Category` and `Product`

### `Category`

CRUD lives at `/api/v1/categories` — writes are admin-only, reads are public. `slug` can be
added together with the product slug later.

| Field | Type | Rules |
|---|---|---|
| `name` | String | required, **unique**, trim, 2–50 chars |
| `createdAt` / `updatedAt` | Date | `timestamps: true` |

### `Product`

| Field | Type | Rules | Notes |
|---|---|---|---|
| `name` | String | required, trim, 2–50 chars | |
| `description` | String | optional, trim, 10–200 chars | Omitted from the document when not sent |
| `price` | Number | required, `min: 0` | Decimal money, e.g. `19.99` |
| `quantity` | Number | required, integer, `min: 0` | |
| `images` | `[String]` | default `[]`, max 5, each a URL | Uploads are not implemented; store URLs |
| `category` | ObjectId | required, `ref: "Category"` | Existence is checked in the controller |
| `createdAt` / `updatedAt` | Date | `timestamps: true` | Automatic |
| `id` | virtual | `toJSON`/`toObject` `virtuals: true` | Derived from `_id` |

> The `timestamps` / `toJSON` / `toObject` options must live in the **second** argument of
> `new mongoose.Schema(...)`. Placing them inside the field-definition object makes Mongoose
> throw `Invalid schema configuration: 'true' is not a valid type at path 'timestamps'` at
> import time — the server never starts.

### `Cart`

One document per user, enforced by a `unique` index on `user`. Items are embedded subdocuments
with `_id: false` — they are addressed by `product`, so a second identifier would be noise.

| Field | Type | Rules | Notes |
|---|---|---|---|
| `user` | ObjectId | required, **unique**, `ref: "User"` | The owner; always taken from `req.user._id` |
| `items[].product` | ObjectId | required, `ref: "Product"` | |
| `items[].quantity` | Number | required, integer, 1–99 | Must match `MAX_ITEM_QUANTITY` in the validator |
| `createdAt` / `updatedAt` | Date | `timestamps: true` | Automatic |

> **No price is stored.** `lineTotal`, `subtotal`, and `totalItems` are computed per response
> from the *current* `Product.price`, rounded to 2 decimals. A price snapshot belongs on the
> order, not the cart.

### `Order`

Created once at checkout and then treated as an immutable financial record. Items are
**snapshots** — `name`, `price`, `image`, and `quantity` are copied from the product, so editing
or deleting a product never rewrites order history. The `product` ref is kept only for linking.

| Field | Type | Rules | Notes |
|---|---|---|---|
| `orderNumber` | String | required, **unique**, uppercase | `ORD-XXXXXX`; retried on collision |
| `user` | ObjectId | required, `ref: "User"` | Always `req.user._id` |
| `items[].product` | ObjectId | required, `ref: "Product"` | Link back to the product |
| `items[].name` | String | required | Snapshot at checkout |
| `items[].image` | String | default `null` | First product image |
| `items[].price` | Number | required, `min: 0` | Snapshot at checkout |
| `items[].quantity` | Number | required, integer, 1–99 | |
| `shippingAddress` | Object | required, `_id: false` | `fullName`, `phone`, `street`, `city`, `postalCode?`, `country` |
| `paymentMethod` | String | enum `["cod"]`, default `"cod"` | `"card"` is added with Stripe |
| `paymentStatus` | String | enum `pending \| paid \| failed \| refunded`, default `pending` | COD becomes `paid` on delivery |
| `status` | String | enum `pending \| confirmed \| shipped \| delivered \| cancelled` | Default `pending` |
| `subtotal` | Number | required, `min: 0` | Server-computed, 2 decimals |
| `shippingFee` | Number | required, `min: 0` | `SHIPPING_FEE` env, default `7.99` |
| `total` | Number | required, `min: 0` | `subtotal + shippingFee` |
| `currency` | String | default `"USD"` | |
| `note` | String | optional, max 500 | Customer note |
| lifecycle dates | Date | optional | `paidAt`, `confirmedAt`, `shippedAt`, `deliveredAt`, `cancelledAt` |
| `cancelReason` | String | optional, max 200 | Set on cancellation |
| `createdAt` / `updatedAt` | Date | `timestamps: true` | Automatic |

Indexes: `{ user: 1, createdAt: -1 }` and `{ status: 1, createdAt: -1 }`.

> **Checkout is one transaction.** The cart is read, every product is decremented with a
> conditional `$inc` (`quantity: { $gte: qty }`), the order is created, and the cart is cleared
> inside `session.withTransaction`. Any failure rolls all three back, so stock and cart can
> never disagree. Cancelling does the reverse — restock + status change — in a transaction.

## 7. Validation reference

### `registerRules`

| Field | Rules | Error message |
|---|---|---|
| `name` | required → trim → 2–50 chars | `Name is required` · `Name must be between 2 and 50 characters` |
| `email` | required → trim → valid email → lowercase | `Email is required` · `Please provide a valid email address` |
| `password` | required → 8–72 chars → ≥1 lower → ≥1 upper → ≥1 digit → ≥1 special → not common | `Password is required` · `Password must be between 8 and 72 characters` · `Password must include at least one lowercase letter` · `... uppercase letter` · `... number` · `... special character` · `This password is too common` |

### `loginRules`

| Field | Rules | Error message |
|---|---|---|
| `email` | required → trim → valid email → lowercase | `Email is required` · `Please provide a valid email address` |
| `password` | required (presence only) | `Password is required` |

Login deliberately applies **no strength rules** — an account created under an older policy must
still be able to sign in.

### `productRules`

| Field | Rules | Error message |
|---|---|---|
| `name` | required → trim → 2–50 chars | `Product name is required` · `Product name must be between 2 and 50 characters` |
| `description` | **optional** → trim → 10–200 chars | `Description must be between 10 and 200 characters` |
| `price` | required → float 0–1 000 000 → `toFloat()` | `Price is required` · `Price must be a number between 0 and 1000000` |
| `quantity` | required → int 0–100 000 → `toInt()` | `Quantity is required` · `Quantity must be a whole number between 0 and 100000` |
| `category` | required → valid ObjectId | `Category is required` · `Category must be a valid category id` |
| `images` | optional → array of ≤5 | `Images must be an array of at most 5 URLs` |
| `images.*` | valid URL | `Each image must be a valid URL` |

`toFloat()` / `toInt()` accept numeric strings, so `"19.99"` and `19.99` both work. The
sanitizers run after the checks, which is why a rejected value never reaches the controller.

### `updateProductRules`

Same field rules as `productRules`, with two differences:

| Difference | Why |
|---|---|
| Every field is `.optional()` | `PUT`/`PATCH` is a partial update — only the sent fields are validated and written. Untouched fields keep their stored value. |
| `param("id").isMongoId()` is added | A malformed `:id` becomes a 422 from the validator instead of a 400 `CastError` from Mongoose. |

`name`, when sent, also rejects an empty string (`Product name cannot be empty`). `images: []`
is valid and clears the gallery. `description` cannot currently be cleared: `""` fails the
10-character minimum.

> A route with **no** rules makes `matchedData` return `{}`, so an update handler reading
> `matchedData` would silently write nothing. That is why `updateProductRules` must be applied
> on the route, not just defined in the validator file.

### `listProductsRules` / `listProductsByCategoryRules`

Query rules for the two public listing endpoints. `listProductsByCategoryRules` is the same set
plus `param("id").isMongoId()` and without `?category=`.

| Field | Rules | Error message |
|---|---|---|
| `page` | optional (`falsy`) → not an array → int ≥ 1 → `toInt()` | `Page must be a whole number greater than 0` |
| `limit` | optional (`falsy`) → not an array → int 1–50 → `toInt()` | `Limit must be a whole number between 1 and 50` |
| `q` | optional (`falsy`) → not an array → trim → 2–100 chars | `Search must be between 2 and 100 characters` |
| `category` | optional (`falsy`) → not an array → `isMongoId` | `Category must be a valid category id` |
| `minPrice` | optional (`falsy`) → not an array → float ≥ 0 → `toFloat()` | `minPrice must be a number greater than or equal to 0` |
| `maxPrice` | same, plus `minPrice ≤ maxPrice` | `maxPrice must be greater than or equal to minPrice` |
| `inStock` | optional (`falsy`) → not an array → `isIn(["true","false"])` | `inStock must be "true" or "false"` |
| `sort` | optional (`falsy`) → not an array → `isIn(SORT_KEYS)` | `Sort must be one of: newest, oldest, …` |

`SORT_KEYS` in the validator must match the `SORTS` map in `controllers/product.controller.js` —
the controller is the only place that turns a name into a Mongo sort, so a client string never
reaches `.sort()`.

`inStock` is deliberately left as a **string**. `toBoolean()` would turn `"false"` into boolean
`false`, and `matchedData` drops falsy values when the chain used `optional({ values: "falsy" })`
— the filter would silently vanish.

### Mechanism notes

- `.bail()` after every `notEmpty()` → one error per field, not a cascade.
- Sanitizers (`.trim()`, `.toLowerCase()`) mutate `req.body` **in place**; the controller
  receives cleaned values with no extra work.
- `.toLowerCase()` is used rather than `.normalizeEmail()` — the latter strips dots from Gmail
  addresses and rewrites `googlemail.com`, which would silently change the identity of an
  existing account.
- The 72-character maximum is not arbitrary: **bcrypt only hashes the first 72 bytes**, so
  anything longer would be silently ignored.

## 8. API reference

Base path: `/api/v1/auth`

### `POST /register`

**Body**

```json
{ "name": "string", "email": "string", "password": "string" }
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "_id": "…", "name": "…", "email": "…", "profileImage": "",
    "isActive": true, "role": "user", "createdAt": "…", "updatedAt": "…",
    "__v": 0, "id": "…"
  }
}
```

**409 Conflict** — `{ "success": false, "message": "User already exists" }`
**422 Unprocessable Entity** — validation error envelope (see below)

### `POST /login`

**Body**

```json
{ "email": "string", "password": "string" }
```

**200 OK** — same `data` shape as register.
**401 Unauthorized** — `{ "success": false, "message": "Invalid email or password" }`

> The 401 message is identical for an unknown email and a wrong password, so the endpoint
> cannot be used to enumerate registered accounts.

## 8b. Product API

Base path: `/api/v1/products`

### `POST /`

**Access:** `protectMiddleware` → `restrictTo("admin")`. No cookie → **401**, authenticated
non-admin → **403**.

**Body**

```json
{
  "name": "string",
  "description": "optional string",
  "price": 19.99,
  "quantity": 4,
  "category": "<category ObjectId>",
  "images": ["https://example.com/a.png"]
}
```

**201 Created**

```json
{
  "success": true,
  "data": {
    "_id": "…",
    "name": "…",
    "description": "…",
    "price": 19.99,
    "quantity": 4,
    "images": ["https://example.com/a.png"],
    "category": { "_id": "…", "name": "…", "id": "…" },
    "createdAt": "…",
    "updatedAt": "…",
    "__v": 0,
    "id": "…"
  }
}
```

**400 Bad Request** — `{ "success": false, "message": "Category does not exist" }`
(the id is well-formed but no category has it).

**422 Unprocessable Entity** — validation envelope, one entry per bad field.

> The controller reads `matchedData`, so `_id`, `slug`, `__v`, or any future field posted by a
> client is silently ignored rather than written to the document.

### `PUT | PATCH /:id`

Both verbs share one handler chain and behave as a **partial update** — send only the fields
you want to change. `PUT` is kept for compatibility; `PATCH` is the more accurate verb.

**Access:** `protectMiddleware` → `restrictTo("admin")` → `updateProductRules` → `validate`.

**Body** — any subset of the create fields, e.g.:

```json
{ "price": 24.99, "quantity": 9 }
```

**200 OK** — the **updated** document, same shape as the 201 above (including the populated
`category`). Untouched fields keep their previous values.

**400 Bad Request**

| Case | Message |
|---|---|
| Empty body (no valid fields) | `No fields to update` |
| `category` is a valid ObjectId but no category has it | `Category does not exist` |

**404 Not Found** — `Product not found`.
**422 Unprocessable Entity** — bad field or malformed `:id` (`Invalid product id`).

> `findByIdAndUpdate` returns the **pre-update** document unless `returnDocument: "after"` is
> passed, and skips schema validators unless `runValidators: true` is passed. Both are required;
> Mongoose 9 deprecates the older `new: true` spelling.

### `GET /` — list products

**Access:** public. Paginated, searchable, filterable, sortable.

| Query param | Type | Default | Notes |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–50 | `20` | 51+ is a **422** — the cap prevents `?limit=100000` |
| `q` | string 2–100 | — | Case-insensitive substring of `name` **or** `description` |
| `category` | ObjectId | — | An unknown but well-formed id returns an empty page, not a 404 |
| `minPrice` / `maxPrice` | number ≥ 0 | — | `minPrice > maxPrice` is a **422**. `0` is treated as "not provided" |
| `inStock` | `"true"` / `"false"` | — | `true` = quantity > 0, `false` = out of stock only |
| `sort` | enum | `newest` | `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc` |

An empty value (`?q=`, `?page=`) is treated as absent, not as invalid input. An unknown param
(`?foo=bar`) is ignored. Repeating a param (`?page=1&page=2`) is a **422** — see the gotcha in
`AGENTS.md`, because express-validator would otherwise hand the controller an array.

**200 OK**

```json
{
  "success": true,
  "data": [ { "_id": "…", "name": "Widget", "price": 19.99, "quantity": 4, "images": [], "category": { "_id": "…", "name": "…" }, "id": "…" } ],
  "pagination": { "page": 1, "limit": 20, "total": 43, "totalPages": 3 }
}
```

`data` stays a **flat array** — `pagination` is a sibling, so callers that already read `data`
keep working. A page past the end returns `data: []` with the real `total`/`totalPages`, never a
404. `totalPages` is `0` for an empty result set.

Sorting always appends `_id` as a tiebreaker (`{ price: 1, _id: -1 }`): without it, documents
sharing a `createdAt` or a price can swap order between pages, so a product is skipped on one
page and repeated on another.

### `GET /category/:id`

The same filters and the same response envelope, with the category fixed by the path. The
`?category=` query param is not accepted here — the path wins, and accepting both would be
ambiguous. `:id` is validated with `isMongoId()` (malformed → **422**). A category with no
products — or an id that no longer exists — returns an empty page.

> Filters are built from `matchedData(req, { locations: ["query"] })`, never from `req.query`
> directly: in Express 5 `req.query` is a getter that is re-parsed on every access, so sanitized
> values do not survive there.

## 8c. Cart API

Base path: `/api/v1/cart`. **Every route requires login** (`router.use(protectMiddleware)`).
There is no `userId` in any body or path — the cart is always the caller's own.

### `GET /`

**200 OK** — the cart, or an empty shape if the user has never added anything
(`_id: null`, `items: []`, `totalItems: 0`, `subtotal: 0`). Never creates a document.

```json
{
  "success": true,
  "data": {
    "_id": "…",
    "user": "…",
    "items": [
      {
        "product": { "_id": "…", "name": "Widget", "price": 19.99, "images": [], "quantity": 10, "category": "…" },
        "quantity": 2,
        "lineTotal": 39.98
      }
    ],
    "totalItems": 2,
    "subtotal": 39.98,
    "updatedAt": "…"
  }
}
```

`product.quantity` is the current **stock** level. Items whose product has been deleted are
filtered out of the response.

### `POST /items`

**Body** — `{ "productId": "<ObjectId>", "quantity": 2 }` (`quantity` optional, defaults to 1).

Adding a product that is already in the cart **increments** its quantity.

**200 OK** — the full cart, same shape as `GET /`.

| Code | Case |
|---|---|
| 400 | `Product is out of stock` · `Only N left in stock` · `You can order at most 99 of this product` |
| 404 | `Product not found` |
| 422 | Missing/malformed `productId`, or `quantity` outside 1–99 |

### `PATCH /items/:productId`

**Body** — `{ "quantity": 3 }` (required). **Sets** the quantity; it does not add to it.
`0` is rejected — removing an item is a `DELETE`.

**200 OK** — the full cart. **404** if the product is not in the cart. **400** if over stock.

### `DELETE /items/:productId`

**200 OK** — the full cart with the item removed. **404** if it was not in the cart.

### `DELETE /`

Empties the cart but keeps the document, so the next add reuses it.

**200 OK** — `{ items: [], totalItems: 0, subtotal: 0 }`.

### Validation reference

| Rule set | Route | Fields |
|---|---|---|
| `addCartItemRules` | `POST /items` | `productId`: required → trim → `isMongoId`. `quantity`: optional → `isInt({min:1,max:99})` → `toInt()` |
| `updateCartItemRules` | `PATCH /items/:productId` | `param("productId")`: `isMongoId`. `quantity`: required → `isInt({min:1,max:99})` → `toInt()` |
| `cartItemParamRules` | `DELETE /items/:productId` | `param("productId")`: `isMongoId` |

## 8d. Order API

Every route requires login (`router.use(protectMiddleware)`). The owner is always
`req.user._id` — no route accepts a `userId`, so cross-user access is not expressible.

| Method | Path | Who | Purpose |
|---|---|---|---|
| `POST` | `/` | user | checkout: convert the cart into an order |
| `GET` | `/` | user | my orders, newest first |
| `GET` | `/:id` | user | one of my orders |
| `PATCH` | `/:id/cancel` | user | cancel + restock, only before shipping |
| `GET` | `/admin` | admin | all orders, optional `?status=` |
| `PATCH` | `/admin/:id/status` | admin | advance the lifecycle |

> `/admin` is registered **before** `/:id`; otherwise the literal prefix is parsed as an
> ObjectId and rejected with a 422, exactly like `/products/category/:id`.

### `POST /` — checkout

**Body** — the address is required; `paymentMethod` defaults to `"cod"`; `note` is optional:

```json
{
  "shippingAddress": {
    "fullName": "Test Buyer",
    "phone": "+201234567890",
    "street": "12 Test Street",
    "city": "Cairo",
    "postalCode": "11511",
    "country": "Egypt"
  },
  "paymentMethod": "cod",
  "note": "Please call before delivery"
}
```

Items, prices, totals, `status`, `paymentStatus`, and `user` are **not accepted** — they are
derived from the caller's cart and `req.user._id`. Because the controller reads `matchedData`,
sending them changes nothing.

**201 Created**

```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-8F3K2A",
    "user": "…",
    "items": [
      {
        "product": "…",
        "name": "Widget",
        "image": "https://…",
        "price": 19.99,
        "quantity": 2
      }
    ],
    "shippingAddress": { "fullName": "Test Buyer", "phone": "+201234567890", "…": "…" },
    "paymentMethod": "cod",
    "paymentStatus": "pending",
    "status": "pending",
    "subtotal": 39.98,
    "shippingFee": 7.99,
    "total": 47.97,
    "currency": "USD",
    "note": "Please call before delivery",
    "createdAt": "…",
    "updatedAt": "…"
  }
}
```

`subtotal` is `Σ price × quantity`, `shippingFee` comes from the `SHIPPING_FEE` env var
(default `7.99`), and `total = subtotal + shippingFee`; all are rounded to 2 decimals and
computed server-side.

| Code | Case |
|---|---|
| 400 | `Your cart is empty` · `Only N left in stock for …` · an item's product was deleted |
| 401 | Not logged in |
| 422 | Missing/invalid address field or a payment method other than `cod` |

On any 400 the transaction aborts: stock is untouched and the cart still holds the items.

### `GET /` and `GET /:id`

Both are scoped to `req.user._id`. Another user's order id returns **404**, not 403, so ids
cannot be enumerated.

### `PATCH /:id/cancel`

Optional body: `{ "cancelReason": "Changed my mind" }`. Only allowed while the order is
`pending` or `confirmed`; the transaction re-reads the order so a double cancel cannot restock
twice. Returns the cancelled order. **400** if it is already cancelled or has shipped.

### `GET /admin`

Admin only. Optional `?status=pending|confirmed|shipped|delivered|cancelled`. Newest first,
`user` populated with `name` and `email`.

### `PATCH /admin/:id/status`

**Body** — `{ "status": "confirmed", "cancelReason": "…"? }`. Forward-only:

```
pending ──► confirmed ──► shipped ──► delivered
   │            │
   └────────────┴──────► cancelled          (restocks)
```

`delivered` is terminal and marks COD as paid (`paymentStatus: "paid"`, `paidAt` set). Any
other transition — including setting `pending`, skipping a step, or cancelling after shipping —
is a **400**. `cancelReason` is only used when moving to `cancelled`.

### Validation reference

| Rule set | Route | Fields |
|---|---|---|
| `createOrderRules` | `POST /` | `shippingAddress.fullName` 2–100 · `phone` matches `^\+?[0-9\s-]{7,20}$` · `street` 5–200 · `city` 2–100 · `postalCode` optional ≤20 · `country` 2–100 · `paymentMethod` optional, `isIn(["cod"])` · `note` optional ≤500 |
| `orderIdRules` | `GET /:id` | `param("id")`: `isMongoId` |
| `cancelOrderRules` | `PATCH /:id/cancel` | `param("id")`: `isMongoId` · `cancelReason` optional ≤200 |
| `updateOrderStatusRules` | `PATCH /admin/:id/status` | `param("id")`: `isMongoId` · `status` required, `isIn(["confirmed","shipped","delivered","cancelled"])` · `cancelReason` optional ≤200 |
| `listOrdersRules` | `GET /admin` | `query("status")` optional, one of the five statuses |

### Validation error envelope (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address", "location": "body" }
  ]
}
```

### Error envelope (other)

```json
{ "success": false, "message": "…", "stack": "…" }
```

`stack` is `null` when `NODE_ENV=production`.

### Status code map

| Code | Meaning |
|---|---|
| 200 | Login succeeded (and most reads/updates) |
| 201 | Registration / product / order creation succeeded |
| 400 | Schema validation failed / malformed id / unknown category / empty cart / insufficient stock / illegal status transition |
| 401 | Bad credentials, missing or invalid token |
| 403 | Authenticated but not allowed (non-admin calling an admin route) |
| 404 | Product (or other addressed resource) not found |
| 409 | Email already registered |
| 422 | Request body failed validation |
| 500 | Unexpected server error |

## 9. Security model

| Concern | Mechanism |
|---|---|
| Password storage | bcrypt, cost factor 10, salted per user |
| Reset tokens | Only the sha256 hash is stored; the raw token is returned once for delivery |
| Mass assignment | Controllers read via `matchedData()`, so only fields with a validation rule can ever reach the model. `role`, `isActive`, `_id` in a request body are ignored. |
| Account enumeration | Identical 401 message for unknown user and wrong password |
| Password leakage | `password` is `select: false`; login strips it before serializing. No password or hash is ever logged. |
| Input trust | Nothing reaches the model without passing `express-validator` first |
| Search input | `?q=` is regex-escaped before being used in a `RegExp`, so `(` cannot throw a 500 or inject a pattern |
| Query filters | Sort is a whitelist (`SORTS`); `limit` is capped at 50; repeated params are rejected |
| Admin-only writes | `restrictTo("admin")` runs after `protectMiddleware` and checks `req.user.role` — the **database** role, not the JWT payload. Demoting an admin takes effect on their next request; an edited token cannot grant admin. |
| Cart ownership | The cart is addressed by `req.user._id` only. No `userId` appears in any cart body or path, and `matchedData` drops an injected `user` field, so cross-user access is not expressible. |

## 10. Extension guide

To add an endpoint — `POST /forgot-password` as an example:

1. **Add rules** in `validators/auth.validator.js`:

   ```js
   export const forgotPasswordRules = [
     body("email")
       .trim().notEmpty().withMessage("Email is required").bail()
       .isEmail().withMessage("Please provide a valid email address").toLowerCase(),
   ];
   ```

2. **Add the route** in `routes/user.route.js` — always `rules → validate → controller`:

   ```js
   router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
   ```

3. **Write the controller** — read with `matchedData`, throw `AppError`, never `try/catch`:

   ```js
   export const forgotPassword = async (req, res) => {
     const { email } = matchedData(req, { locations: ["body"] });
     const user = await User.findOne({ email });
     // Always respond 200 — never reveal whether the account exists.
     if (user) {
       const rawToken = user.getResetPasswordToken();
       await user.save();
       await sendResetEmail(email, rawToken);
     }
     res.status(200).json({ success: true, message: "If that email exists, we sent a link" });
   };
   ```

4. **Add a matching schema rule** if the model gains a field — the schema is the last line of
   defense and must not disagree with the validator. On updates, remember
   `runValidators: true` or the schema rules are skipped entirely.

### Protected and role-gated routes

Auth middleware belongs **before** validation on protected writes, so an unauthenticated caller
gets a clean 401 instead of a 422 that leaks the field rules. Role gates go after
`protectMiddleware` (which is what sets `req.user`):

```js
router.post("/", protectMiddleware, restrictTo("admin"), productRules, validate, createProduct);
router.get("/me", protectMiddleware, getMe);
```

A router whose routes are **all** protected can apply the guard once:

```js
router.use(protectMiddleware); // routes/cart.route.js
```

## 11. Roadmap

| Item | State |
|---|---|
| JWT / session tokens | Done — httpOnly `jwt` cookie, `protectMiddleware` verifies it on protected routes |
| Role-based access | Done — `middleware/restrictTo.js`; used by `POST /api/v1/products` |
| Products | Done — create/update/delete (admin) + paginated public listing with search, filters and sorting |
| Categories | Done — `models/Category.model.js`, CRUD at `/api/v1/categories` |
| Cart | Done — one per user, live pricing, stock enforced. No price snapshot (that belongs on the order) |
| Orders | Done — COD checkout from the cart, snapshot prices, transactional stock, cancel/restock, admin lifecycle |
| Password reset | Model-side scaffolding exists (`getResetPasswordToken()`, expiry fields); no route, controller, or email delivery |
| Email delivery | Not started — includes order confirmations |
| Payments | COD done; card payments (Stripe) not started |
| Image uploads | Not started — products store image URLs |
| `services/` layer | Deliberately skipped — business logic lives in controllers while the codebase is small |
| Rate limiting / brute-force lockout | Not started |
| Tests | Not started |

## 12. Environment & runbook

```bash
pnpm dev          # nodemon server.js
node server.js    # plain run
```

**Required env var**

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.kjfbhkh.mongodb.net/best-shop-db
```

**Optional env var**

```
SHIPPING_FEE=7.99   # flat USD shipping fee; defaults to 7.99 when absent or malformed
```

### DNS gotcha on this machine

`lib/connectDB.js` forces known-good DNS resolvers before connecting:

```js
dns.setServers(["192.168.1.1", "8.8.8.8", "1.1.1.1"]);
```

**This is load-bearing, not cruft.** The OS default resolver reports `127.0.0.1`, where nothing
listens on port 53, which breaks the SRV lookup that `mongodb+srv://` requires —
`querySrv ECONNREFUSED`, thrown before any connection to Atlas is attempted.

Any script that connects to Mongo *outside* `connectDB()` must apply the same workaround,
or it will fail to resolve even though the running app connects fine.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `querySrv ECONNREFUSED` | DNS resolver can't do SRV lookups | Confirm `dns.setServers(...)` is in effect |
| `MONGODB connection error` | Bad `MONGO_URI` / IP not on the Atlas allow-list | Check `.env` and Atlas network access |
| 422 on a valid-looking payload | A rule rejected it | Read the `errors` array — each entry names the field and the exact reason |
| 500 with a Mongoose `ValidationError` | Body passed the validator but failed the schema | The two rule sets have drifted apart; sync them |
