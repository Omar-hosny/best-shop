# best-shop

Backend API for an e-commerce shop. Currently implements **authentication**
(register, login, logout, me), **products / categories**, the **cart**, and
**cash-on-delivery orders** against MongoDB Atlas.

> Structural reference — diagrams, data model, full API contract — lives in
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Stack

|                 |                                                                 |
| --------------- | --------------------------------------------------------------- |
| Runtime         | Node 22, ESM (`"type": "module"` — use `import`, not `require`) |
| Framework       | Express 5.3                                                     |
| ODM             | Mongoose 9.11                                                   |
| Validation      | express-validator 7.3                                           |
| Hashing         | bcryptjs 3                                                      |
| Cookies         | cookie-parser 1.4 (mounted in `server.js`)                      |
| Security        | helmet 8.3 (headers), express-rate-limit 8.7 (429s)             |
| Package manager | pnpm 12.14 (`pnpm-lock.yaml`)                                   |

## Layout

```
server.js              entry point — env checks, app setup, route mount, error middleware
lib/connectDB.js       Mongo connection + the DNS workaround (see Gotchas)
lib/validateEnv.js     boot-time env checks; exits on a missing/weak production secret
lib/createToken.js     signs the JWT and sets it as an httpOnly cookie
lib/cookie.js          cookie name + options, shared by createToken and logout
lib/createOrderNumber.js human-readable order numbers, e.g. ORD-8F3K2A
.env.example           every supported env var with a comment (copy to `.env`)
routes/user.route.js   route table for /api/v1/auth
routes/product.route.js route table for /api/v1/products (admin-only write)
routes/cart.route.js   route table for /api/v1/cart (every route requires login)
routes/order.route.js  route table for /api/v1/orders (login required; admin list/status)
controllers/           business logic only — no validation, no try/catch
validators/            express-validator rule chains
middleware/            validate.js, protectMiddleware.js, restrictTo.js,
                       rateLimiters.js, errorMiddleware.js, AppError.js
models/User.model.js   Mongoose schema, pre-save hooks, instance methods
models/Product.model.js  product schema (name, description, price, quantity, images, category)
models/Category.model.js category schema — CRUD at /api/v1/categories
models/Cart.model.js   one cart per user, embedded items, no stored prices
models/Order.model.js  order schema — snapshot items, address, status, payment fields
app.js                 empty 0-byte leftover — ignore it
```

## Request lifecycle

```
route → [rate limiter] → protectMiddleware → restrictTo("admin")
      → [validation rules] → validate → controller → model → response
```

`server.js` mounts the routers at `/api/v1/auth`, `/api/v1/products`, `/api/v1/categories`,
`/api/v1/cart`, and `/api/v1/orders`:

```js
router.post("/register", registerLimiter, registerRules, validate, registerUser);
router.post("/login", loginLimiter, loginRules, validate, loginUser);
router.post("/", protectMiddleware, restrictTo("admin"), adminWriteLimiter, productRules, validate, createProduct);
router.put("/:id", protectMiddleware, restrictTo("admin"), adminWriteLimiter, updateProductRules, validate, updateProduct);
router.patch("/:id", protectMiddleware, restrictTo("admin"), adminWriteLimiter, updateProductRules, validate, updateProduct);
router.post("/items", protectMiddleware, userLimiter, addCartItemRules, validate, addCartItem);
router.post("/", protectMiddleware, userLimiter, checkoutLimiter, createOrderRules, validate, createOrder);
```

The controller is unreachable unless the payload passed validation. On protected writes auth
runs **before** validation, so an anonymous caller gets 401 rather than a 422 that leaks the
field rules. On `/auth/login` the limiter runs before validation so a brute-force attempt never
reaches the bcrypt comparison.

## Conventions

### Validation

- Rules live in `validators/*.validator.js`, one exported array per endpoint.
- Never hand-roll `if (!field)` checks in a controller.
- `.bail()` after every `notEmpty()` so a missing field reports one error, not three.
- Sanitizers (`.trim()`, `.toLowerCase()`) mutate `req.body` in place — the controller
  receives cleaned values automatically. Don't re-trim in the controller.
- **Create and update need separate rule sets.** `productRules` requires every field;
  `updateProductRules` marks every field `.optional()` so a partial update works. Reusing the
  create rules on `PUT`/`PATCH` would force clients to resend the whole document.
- Validate `:id` params with `param("id").isMongoId()` so a malformed id is a 422 from the
  validator instead of a 400 `CastError` from Mongoose.

### Reading input

Use `matchedData`, not `req.body`:

```js
import { matchedData } from "express-validator";
const { name, email, password } = matchedData(req, { locations: ["body"] });
```

`matchedData` returns **only fields that have a validation rule**, so a client cannot smuggle in
`role`, `isActive`, or `_id`. Using `req.body` instead silently opens a mass-assignment hole.

Query params are read the same way — `matchedData(req, { locations: ["query"] })`. Never read
`req.query` directly: in Express 5 it is a getter that re-parses on every access, so values
produced by `toInt()` / `toFloat()` exist **only** in `matchedData`.

This also means **a route with no validation rules yields `matchedData` = `{}`**. An update
handler that calls `findByIdAndUpdate(id, matchedData(...))` without rules on the route is a
silent no-op — the request succeeds and nothing changes.

### Authorization

`middleware/restrictTo.js` gates a route by role. It must come **after** `protectMiddleware`,
because that is what sets `req.user`:

```js
router.post("/", protectMiddleware, restrictTo("admin"), productRules, validate, createProduct);
```

- It reads `req.user.role` from the **database**, not the JWT payload. Demoting an admin takes
  effect on their next request, and an edited token cannot grant admin.
- No user → 401; wrong role → 403. Never 404 — the caller is allowed to know the route exists.
- There is no promotion endpoint. Flip the role in Atlas/Compass:
  `db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })`.
  No re-login is required, because the role is loaded per request.

### Rate limiting

`middleware/rateLimiters.js` centralises every limiter. They are layered: the global limiter is
a safety net, and route-specific buckets stack on top of it.

| Limiter             | Scope                          | Key                         | Limit         |
| ------------------- | ------------------------------ | --------------------------- | ------------- |
| `globalLimiter`     | every `/api/v1` route          | IP                          | 300 / 15 min  |
| `loginLimiter`      | `POST /auth/login`             | email + IP (failures only)  | 10 / 15 min   |
| `registerLimiter`   | `POST /auth/register`          | IP                          | 5 / hour      |
| `userLimiter`       | cart + orders routers          | `req.user._id`              | 120 / 15 min  |
| `checkoutLimiter`   | `POST /orders`                 | `req.user._id`              | 10 / hour     |
| `adminWriteLimiter` | product/category mutations     | `req.user._id`              | 60 / 15 min   |

- **429s flow through `errorMiddleware`.** Each limiter's `handler` calls
  `next(new AppError(message, 429))`, so the body stays `{ "success": false, "message": ... }`
  and the production stack redaction still applies. `standardHeaders: "draft-8"` adds the
  `RateLimit-*` headers and `Retry-After`.
- **Login is keyed by email + IP, never email alone.** An email-only key would let an attacker
  lock a victim out of their own account. `skipSuccessfulRequests: true` means only failures
  count, so a user signing in repeatedly is never punished.
- **Authenticated limiters are keyed by `req.user._id`**, so they must be mounted **after**
  `protectMiddleware`. Keying those by IP would make everyone behind one NAT share a bucket.
- **A custom key generator that falls back to an IP must call `ipKeyGenerator(req.ip)`**, not
  `req.ip`. It groups IPv6 clients by /64 so one client cannot rotate addresses for fresh buckets.
  `express-rate-limit` validates this and throws otherwise.
- **The store is in-memory.** Limits are per process and reset on restart. That is fine for a
  single instance; a second instance or a serverless deployment needs a shared store (Redis or
  Mongo) or each instance gets its own full budget. Swap the `store` option in `rateLimiters.js`
  and prefix each limiter's keys so buckets do not collide.
- `/health` is mounted **before** the global limiter, so uptime monitors cannot be throttled.

### Errors

- Throw `new AppError(message, statusCode)` from `middleware/AppError.js`.
- **Do not wrap controllers in try/catch.** Express 5 forwards rejected promises to
  `errorMiddleware` automatically. A try/catch would intercept the error and break the mapping.
- `errorMiddleware` maps: Mongoose `ValidationError` → 400, duplicate key `11000` → 409,
  `CastError` → 400, `AppError` → its own status, anything else → 500. In production every 5xx
  message is replaced with `"Something went wrong"`; the real cause only goes to the log.

| Situation                | Status |
| ------------------------ | ------ |
| Input validation failed  | 422    |
| Schema validation failed | 400    |
| Unknown category id      | 400    |
| Email already registered | 409    |
| Bad credentials          | 401    |
| Not authenticated        | 401    |
| Authenticated, not admin | 403    |
| Rate limit exceeded      | 429    |
| Unexpected               | 500    |

### Response shape

Success:

```json
{ "success": true, "data": { ... } }
```

Validation failure (422):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "...", "location": "body" }]
}
```

Other errors: `{ "success": false, "message": "...", "stack": "..." }` — `stack` is `null` when
`NODE_ENV=production`.

### Password policy

`registerRules` — min 8, max 72, plus one lowercase, one uppercase, one digit, one special
character, and a common-password deny-list.

`loginRules` — **presence only**. No strength rules: an account created under an older policy must
still be able to log in.

Changing the policy means changing **both** `validators/auth.validator.js` and the schema's
`minlength`/`maxlength` in `models/User.model.js`. The schema is the last line of defense; if the
two disagree, one of them is lying.

The frontend must mirror the register rules but not the login rules.

## Gotchas

- **express-validator v7 renamed `error.param` → `error.path`.** Using the old name yields
  `field: undefined`. `middleware/validate.js` reads `error.path ?? error.param`.
- **bcrypt truncates past 72 bytes.** A 100-char password would have its tail silently ignored.
  That's why the max length is 72, not 128.
- **`password` is `select: false`** in the schema. Login uses `.select("+password")` and must
  strip the field before serializing — otherwise the bcrypt hash is sent to the client.
- **Never log passwords or hashes.** `comparePassword()` must stay free of `console.log`.
- **`req.cookies` is `undefined` without `cookie-parser`.** Express 5 does not parse cookies.
  Reading `req.cookies.jwt` without the middleware throws `TypeError: Cannot read properties of
  undefined (reading 'jwt')`, which surfaces as a 500 — not a 401. `server.js` mounts
  `cookieParser()` before the routes, and `protectMiddleware` still uses `req.cookies?.[JWT_COOKIE]`
  so the failure stays a clean 401 if the mount is ever removed.
- **The DNS workaround in `lib/connectDB.js` is load-bearing on this machine.** The OS default
  resolver reports `127.0.0.1` where nothing listens on port 53, which breaks the SRV lookup that
  `mongodb+srv://` requires (`querySrv ECONNREFUSED`). The file forces known-good resolvers.
  Any script that connects to Mongo _outside_ `connectDB()` must do the same, or it will fail to
  resolve even though the app connects fine.
- **Express 5 forwards async errors**, so `async` handlers need no wrapper.
- **Schema options go in the second argument of `new mongoose.Schema()`.** `timestamps`,
  `toJSON`, and `toObject` placed inside the field object are read as *paths* — Mongoose then
  throws `Invalid schema configuration: 'true' is not a valid type at path 'timestamps'` and the
  process dies at import time. This is why the product model must be import-tested after edits.
- **`body("images.*")` wildcard rules only expand for arrays/objects.** When `images` is a
  string, the `images` array check is what rejects it; the wildcard contributes no errors. Keep
  both rules or a non-array slips through.
- **Plain `optional()` does not skip an empty query value.** It only skips `undefined`, so
  `?page=` fails `isInt` with a confusing "Invalid value". Use `optional({ values: "falsy" })`
  for every query filter.
- **`optional({ values: "falsy" })` also drops sanitized falsy values from `matchedData`.** A
  `toBoolean()` sanitizer turning `"false"` into `false` makes the field disappear entirely — the
  filter silently stops filtering. That is why `inStock` stays a `"true"`/`"false"` **string**
  and the controller compares strings.
- **Repeated query params bypass validation.** `?page=1&page=2` arrives as `["1","2"]`, and
  `isInt` passes on that array; the controller then computes `skip(NaN)` and the request dies as
  a 500. Every listing rule starts with `.not().isArray()` (see `queryParam()` in
  `validators/product.validator.js`).
- **`?q=` goes into a `RegExp`, so it must be escaped.** `?q=(` otherwise throws
  `SyntaxError: Invalid regular expression` and surfaces as a 500. `escapeRegex()` in the product
  controller handles it.
- **Never pass a client string to `.sort()`.** Sort keys are a whitelist (`SORT_KEYS` in the
  validator, `SORTS` in the controller — they must agree). Sorting also appends `_id` as a
  tiebreaker, or products sharing a `createdAt`/price shuffle between pages and get skipped or
  duplicated while paging.
- **Optional fields and the schema must agree on emptiness.** `description` is optional in the
  validator but has `minlength: 10` in the schema, so the controller omits it when absent rather
  than storing `""` (which the schema would reject with a 400).
- **`findByIdAndUpdate` returns the OLD document by default.** Pass `returnDocument: "after"` or
  the response shows pre-update values. Mongoose 9 deprecates `new: true` for the same option —
  using it logs a warning on every update.
- **`runValidators: true` is required on updates.** Without it Mongoose skips `min`,
  `minlength`, and custom validators, so `price: -5` is written straight to the database and only
  fails on the *next* save.
- **Route order matters for static prefixes.** `/:id` registered before `/category/:id` swallows
  the literal path — `/category/abc` arrives as `id = "category"` and fails as a malformed
  ObjectId. Register the more specific route first.
- **The cart never trusts a client-supplied user.** The owner is always `req.user._id`. Any
  `user` field in a cart request body is ignored by `matchedData`, and no route accepts a
  `userId` param, so cross-user access is not expressible.
- **Carts are created with an upsert, not `findOne` → `create`.** Two concurrent adds for a user
  with no cart would race the `unique` index on `user` and surface as a 409. `findOneAndUpdate`
  with `$setOnInsert` + `upsert: true` is atomic.
- **Cart prices are live, not snapshotted.** `GET /cart` reflects the current `Product.price`.
  A price change is visible immediately; the order endpoint is where a price gets frozen.
- **Orders snapshot `name`, `price`, `image`, and `quantity`.** Editing or deleting a product
  must not rewrite order history. The item also keeps a `product` ref for linking, but the
  response never has to re-read the product.
- **Checkout is one Mongo transaction.** `POST /orders` reads the cart, does a conditional
  `$inc` (`quantity: { $gte: qty }`) per product, creates the order, and clears the cart all in
  `session.withTransaction`. If anything throws, stock and cart roll back together. Atlas is a
  replica set, so transactions are available; a standalone MongoDB is not.
- **Cancelling restocks inside a transaction.** Cancelling is only allowed while the order is
  `pending` or `confirmed`; the order is re-read inside the transaction so two concurrent
  cancels cannot both restock. `delivered` and `cancelled` are terminal.
- **Status moves forward only.** `pending → confirmed → shipped → delivered`, or `cancelled`
  before shipping. An admin requesting anything else gets a 400. Reaching `delivered` also sets
  `paymentStatus: "paid"` and `paidAt` for COD — that is when the cash is collected.
- **`/orders/admin` must be registered before `/orders/:id`.** Same static-prefix trap as
  `/products/category/:id`; otherwise `admin` is parsed as an ObjectId and fails as a 422.
- **Order numbers are generated with a retry.** `lib/createOrderNumber.js` produces an
  unambiguous `ORD-XXXXXX`; the unique index on `orderNumber` is the real guarantee, and
  `createOrder` retries the whole transaction on a duplicate-key error (the failed attempt rolls
  back, so the retry is safe).
- **`SHIPPING_FEE` is optional and defaults to `7.99`.** A missing or malformed value falls back
  to the default instead of putting `NaN` in a money field. Currency is fixed to `USD`.
- **A user must never see another user's order.** `getOrder` filters by `{ _id, user: req.user._id }`
  and returns 404, not 403, so order ids are not enumerable.
- **`TRUST_PROXY` is a hop count, never `true`.** `true` trusts a client-supplied
  `X-Forwarded-For`, so anyone can pick a fresh IP per request and bypass every IP-based limit.
  A bare numeric string (`"1"`) must be converted with `Number()` before `app.set("trust proxy")`
  — Express parses strings as an **IP allowlist**, not a hop count. Local development defaults to
  `loopback`.
- **The rate limiter must be mounted after `cookieParser` and body parsing.** The global limiter
  only needs `req.ip`, but `loginLimiter` reads `req.body.email` for its key and the user-keyed
  limiters need `req.user` from `protectMiddleware`. Mounting them in the wrong order silently
  degrades them to weak or shared keys.
- **`express-rate-limit` refuses to guess when `X-Forwarded-For` is present but trust proxy is
  off.** That surfaces as an error, not a silent bypass — which is why `server.js` sets
  `trust proxy` before mounting the limiter and production must declare `TRUST_PROXY`.

## Commands

```bash
pnpm dev              # nodemon server.js
node server.js        # plain run
pnpm seed             # upsert fixture categories, products, demo users
pnpm seed:fresh       # wipe Products + Categories, then seed (dev/test DB only)
```

`lib/validateEnv.js` runs at boot. `MONGO_URI` and `JWT_SECRET` are required;
production additionally requires a 32+ character `JWT_SECRET` and an explicit `TRUST_PROXY`.
Copy `.env.example` to `.env`.

### Seeding

`seeds/data.js` is the fixture source of truth — 8 categories and 60 products shaped to
exercise pagination, search, filters, sorting, and stock errors, plus 2 demo accounts:

- `admin@best-shop.dev` / `Admin123!` (`role: "admin"`)
- `user@best-shop.dev` / `User1234!` (`role: "user"`)

`seeds/seed.js` **upserts by name/email** so rerunning is safe: fixtures are corrected,
never duplicated, and an existing user's password is never touched. `--fresh` deletes *all*
Products and Categories first (users, carts, and orders are left alone; orders keep their
snapshotted items). Product `createdAt` values are staggered by fixture order so
`sort=newest` / `sort=oldest` have a real order, and `timestamps: false` on the upsert is
what lets them stick. The script reuses `lib/connectDB.js` for the DNS workaround — a
direct `mongoose.connect()` fails with `querySrv ECONNREFUSED` on this machine.

## Current status

Done:

- Register / login with express-validator validation, layered errors, password hashing.
- JWT auth cookie: `lib/createToken.js` signs `{ id, role }` and sets it in an `httpOnly`
  `jwt` cookie. Cookie name and options live in `lib/cookie.js` — `res.cookie` and
  `res.clearCookie` both import from there, because a mismatch (especially `path`) makes
  logout silently fail. It is a session cookie: no `maxAge`, so the token's `exp` is the
  only ceiling.
- `POST /api/v1/auth/logout` clears the cookie and is idempotent — no auth required.
  Login still returns the user object and **no token in the body**.
- `GET /api/v1/auth/me` is protected by `middleware/protectMiddleware.js`: it reads the `jwt`
  cookie (via `cookie-parser`, mounted before the routes), verifies the signature with
  `JWT_SECRET`, loads the user, and attaches it as `req.user`. Missing cookie → 401,
  malformed/tampered token → 401, expired token → 401, deleted user → 404.
  `getMe` returns `req.user.toObject()` — no second query.
- Logout is client-side only: the JWT stays valid until `exp` for anyone who copied it.
  The cookie is only verified on protected routes, so there is no revocation.
- `POST /api/v1/products` creates a product. Guarded by `protectMiddleware` →
  `restrictTo("admin")` → `productRules` → `validate`. Reads `matchedData`, verifies the
  `category` exists (400 if not), populates `category` in the 201 response, and ignores injected
  `_id` / `slug` / `__v`. Verified with a smoke test: 401 (no cookie), 403 (normal user),
  422 (bad body), 400 (unknown category), 201 (admin).
- `PUT|PATCH /api/v1/products/:id` updates a product — admin only, partial by design.
  `updateProductRules` marks every field `.optional()` and validates `:id` as an ObjectId.
  The controller rejects an empty payload (400 `No fields to update`), re-checks the category
  (400 if missing), and uses `findByIdAndUpdate` with `returnDocument: "after"` +
  `runValidators: true`, then populates `category`. Verified: 200 with the **new** values,
  untouched fields preserved, 422 on invalid fields, 400 on unknown category, 404 on missing
  product, 422 on malformed id, 401/403 on access.
- `GET /api/v1/products` is public and **paginated** (`page`, `limit` default 20 / max 50),
  with `q` (case-insensitive substring of `name`/`description`), `category`, `minPrice`/
  `maxPrice`, `inStock`, and a whitelisted `sort` (`newest` default, plus `oldest`, `price_asc`,
  `price_desc`, `name_asc`, `name_desc`). `data` stays a flat array; `pagination: { page, limit,
  total, totalPages }` is a sibling. `GET /api/v1/products/:id` and
  `/api/v1/products/category/:id` are public too — the category route takes the same filters,
  and is registered **before** `/:id` so the literal prefix is not swallowed by the id route.
  Verified with 20 smoke checks: paging without repeats, page past the end (empty, not 404),
  422 on `limit=51` / `page=0` / repeated params / `sort=hack` / `minPrice > maxPrice`, a
  metacharacter search (`?q=(*`) returns 200 instead of a regex 500, and filters/sorts checked
  against real documents.
- Deleting a category that still has products is a **400** (`Category has products`) instead of
  leaving dangling `Product.category` refs that no listing could ever surface again.
- `models/Category.model.js` backs `Product.category`. Category CRUD lives at
  `/api/v1/categories` (`POST`/`PUT`/`DELETE` admin-only, `GET` public).
- Cart lives at `/api/v1/cart` and is **always the caller's own** — there is no `userId` in any
  body or path, and `router.use(protectMiddleware)` guards every route. One cart document per
  user (`unique` index on `user`), created atomically with an upsert on first add.
  Endpoints: `GET /` (read), `POST /items` (add or increment), `PATCH /items/:productId`
  (set quantity), `DELETE /items/:productId` (remove), `DELETE /` (empty).
  Items store only `{ product, quantity }` — prices are read live from `Product`, and
  `subtotal` / `lineTotal` / `totalItems` are computed per response with 2-decimal rounding.
  Stock is enforced on add and update (400 when over `Product.quantity`), duplicates increment,
  and items whose product was deleted are filtered out of the response. Verified with 31 smoke
  checks including cart isolation between two users and ignored `user` / `price` / `_id`
  injections.
- Cash-on-delivery orders live at `/api/v1/orders` (`router.use(protectMiddleware)` guards every
  route). `POST /` converts the caller's cart into an order inside one transaction: items are
  snapshotted (name, price, first image, quantity), stock is decremented atomically with a
  conditional `$inc`, the order is created, and the cart is cleared. The total is
  `subtotal + SHIPPING_FEE` (default `7.99`, currency `USD`), computed server-side only.
  `GET /` and `GET /:id` are scoped to the caller (another user's order → 404);
  `PATCH /:id/cancel` restocks and only works before shipping.
  Admin endpoints: `GET /admin?status=` lists all orders (populating `user.name`/`user.email`)
  and `PATCH /admin/:id/status` walks the forward-only lifecycle
  `pending → confirmed → shipped → delivered`, or `cancelled` before shipping. `delivered` marks
  COD as paid. Verified with 45 smoke checks: mass-assignment attempts (`status`, `total`,
  `user`, `items`) ignored, stock/cart rollback on insufficient stock, cancel restocking once,
  cross-user isolation, and every legal/illegal status transition.
- API hardening: `helmet()` security headers, `x-powered-by` off, `POST /auth/login` and
  `/auth/register` rate-limited, account-keyed limiters on cart/orders/admin writes, a JSON 404
  handler, boot-time env validation, JWT verification pinned to `HS256`, and production 5xx
  messages redacted. `/health` is public and outside the limiter. Password strength rules
  (lowercase/uppercase/digit/special/common-password deny-list) are enforced on register and
  documented in `.env.example`.

Scaffolded but not wired up:

- `resetPasswordToken`, `resetPasswordExpires`, `getResetPasswordToken()` on the User model —
  there is no route or controller using them yet.

Not built yet:

- Card payments (Stripe) — the order model already has `paymentMethod` / `paymentStatus`, so
  this adds a PaymentIntent, a raw-body webhook mounted before `express.json()`, and stock
  release for abandoned orders
- Order emails / notifications, and an admin dashboard
- Product slugs (deferred; `_id` is the identifier today)
- Image uploads — products store URLs only
- Server-side token revocation (refresh tokens or a `tokenVersion` field)
- CORS — `sameSite: "strict"` works across `localhost` ports but not across real domains
- Password-reset flow, email sending
- `services/` layer — deliberately skipped; business logic lives in controllers for now

## Before you finish a change

- [ ] New input validated in `validators/`, applied on the route
- [ ] Controller reads via `matchedData`, not `req.body`
- [ ] Errors thrown as `AppError` with a sensible status — no try/catch in controllers
- [ ] No password or hash in any response or log
- [ ] New route has an appropriate limiter from `middleware/rateLimiters.js`
- [ ] Smoke-test the endpoint with curl and confirm the status code and body shape

## Git workflow

- Do NOT create branches, commits, pushes, pulls, merges, or any other git state
  changes unless the user explicitly asks for them in that message.
- Leave all work uncommitted in the working tree by default — for both the
  backend and `frontend/`. The user decides when to commit.

