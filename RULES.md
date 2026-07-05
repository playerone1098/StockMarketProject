# StockVista — Project Architecture Rules

> These rules define the clean architecture and coding standards for the StockVista project.
> All contributors (human and AI) MUST follow these rules.

---

## 1. Project Structure

```
CashbackProject/                  (root — will rename repo to StockVista)
├── backend/                      Node.js + Express REST API
├── frontend/                     React public website
├── admin/                        React admin panel
├── RULES.md                      This file
├── AI_CODING_RULES.md            AI-specific coding guidelines
└── README.md                     Project documentation
```

---

## 2. Backend Architecture (Layered)

### Layer Hierarchy

```
Routes → Controllers → Services → Models
  │           │            │          │
  │           │            │          └── Data access (Mongoose schemas)
  │           │            └── Business logic, validation, data transformation
  │           └── Request/response handling, HTTP status codes
  └── Route definitions, middleware binding
```

### Rules

1. **Routes** (`routes/`) — ONLY define HTTP methods, paths, and bind middleware + controllers.
   - NO business logic in routes
   - NO direct model access in routes
   - Keep routes thin — max 5-10 lines per endpoint

2. **Controllers** (`controllers/`) — Handle HTTP request/response.
   - Extract data from `req.body`, `req.params`, `req.query`
   - Call service functions
   - Send HTTP responses with proper status codes
   - Use `catchAsync` wrapper for all async handlers
   - ONE controller file per resource (e.g., `tradingIdeaController.js`)

3. **Services** (`services/`) — Contain ALL business logic.
   - Never import `req` or `res` — services are HTTP-agnostic
   - Handle data validation, transformation, and business rules
   - Interact with models for database operations
   - Throw `ApiError` for error cases
   - Services are testable in isolation

4. **Models** (`models/`) — Define Mongoose schemas and data-level logic only.
   - Schema definition, indexes, virtuals
   - Pre/post hooks (e.g., password hashing, slug generation)
   - Instance methods and statics that are purely data-related
   - NO HTTP or business logic in models

### Directory Structure

```
backend/
├── config/              Centralized configuration
│   └── index.js         All env vars exported from one place
├── controllers/         Request handlers (one per resource)
├── middleware/           Express middleware (auth, errors, validation)
├── models/              Mongoose schemas
├── routes/              Route definitions
├── services/            Business logic (optional, add as complexity grows)
├── utils/               Shared utilities (ApiError, catchAsync, formatters)
├── scripts/             Seed scripts, admin creation, migrations
├── server.js            Entry point — app setup, DB connect, route registration
├── .env                 Environment variables (NEVER commit)
├── .env.example         Template for .env (ALWAYS commit)
└── package.json
```

---

## 3. Frontend Architecture

### Rules

1. **Pages** (`pages/`) — Route-level components, one per route.
   - Fetch data, manage page-level state
   - Compose from reusable components
   - Include SEO metadata via `<Helmet>`

2. **Components** (`components/`) — Reusable UI building blocks.
   - Accept props, render UI
   - NO direct API calls inside components (pass data via props)
   - Exception: Layout components (Navbar, Footer) that fetch their own data

3. **Services** (`services/`) — ALL API calls live here.
   - One service file per backend resource
   - Export clean async functions (e.g., `getTradingIdeas(filters)`)
   - Never import axios directly in pages/components

4. **Hooks** (`hooks/`) — Custom React hooks for reusable logic.
   - `useFetch` for data fetching patterns
   - Keep hooks pure and reusable

5. **Utils** (`utils/`) — Pure utility functions.
   - Formatters (price, date, percentage)
   - No side effects, no API calls

6. **Constants** (`constants/`) — Shared constants.
   - Route paths, enum values, config values
   - Single source of truth

### Directory Structure

```
frontend/src/
├── components/          Reusable UI components
├── pages/               Route-level page components
├── services/            API call functions
├── hooks/               Custom React hooks
├── utils/               Pure utility functions
├── constants/           Shared constants
├── context/             React Context providers (if needed)
├── App.js               Root component with routing
├── index.js             Entry point
└── index.css            Global styles
```

---

## 4. Admin Panel Architecture

Same rules as frontend, with these additions:

1. **Forms** — Separate form pages from list pages (e.g., `IPOs.js` for list, `IPOForm.js` for create/edit)
2. **Auth** — Use `PrivateRoute` for all authenticated routes
3. **State** — Store auth token in `localStorage` as `adminToken`

---

## 5. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files (JS) | camelCase | `tradingIdeaController.js` |
| React Components | PascalCase | `StockCard.js`, `<StockCard />` |
| Models | PascalCase (singular) | `TradingIdea.js` |
| Routes | kebab-case URLs | `/api/trading-ideas` |
| Database collections | lowercase plural | `tradingideas` |
| CSS classes | kebab-case | `.market-ticker` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Functions | camelCase | `formatPrice()` |
| Env variables | UPPER_SNAKE_CASE | `MONGODB_URI` |
| Git branches | kebab-case | `feature/ipo-tracker` |

---

## 6. Error Handling

### Backend
- Use `ApiError` class for all application errors
- Use `catchAsync` wrapper on all async route handlers
- Centralized `errorHandler` middleware catches all errors
- Never let unhandled promise rejections crash the server

### Frontend
- Every API call must handle loading, success, and error states
- Show user-friendly error messages (never raw error objects)
- Use try/catch in all async operations
- Log errors to console in development only

---

## 7. API Response Format

All API responses MUST follow this shape:

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "VALIDATION_ERROR"
}
```

---

## 8. Security Rules

1. **Environment**: ALL secrets in `.env`, NEVER hardcode
2. **Authentication**: JWT tokens with reasonable expiry
3. **Validation**: Validate ALL input on the server side (never trust the client)
4. **Sanitization**: Sanitize all user input before database queries
5. **Headers**: Use `helmet()` for secure HTTP headers
6. **Rate Limiting**: Apply rate limiting on all public API routes
7. **CORS**: Whitelist only allowed origins in production
8. **Passwords**: Always hash with bcrypt (12+ salt rounds)

---

## 9. Git Workflow

1. **Commits**: Use conventional commits:
   - `feat: add IPO tracker page`
   - `fix: correct price formatting`
   - `refactor: extract stock service`
   - `docs: update README`
   - `style: fix navbar alignment`
   - `chore: update dependencies`

2. **Branches**:
   - `main` — production-ready code
   - `develop` — integration branch
   - `feature/*` — new features
   - `fix/*` — bug fixes

3. **Never commit**: `.env`, `node_modules/`, `build/`, `*.log`

---

## 10. Code Quality

1. **File size**: No file > 300 lines. Split if larger.
2. **Function size**: No function > 50 lines. Extract helpers.
3. **Comments**: Explain WHY, not WHAT. Use JSDoc for function signatures.
4. **DRY**: If you copy-paste code, extract it into a utility.
5. **No dead code**: Remove commented-out code and unused imports.
6. **Console.log**: Remove all `console.log` before committing (use proper logging).
