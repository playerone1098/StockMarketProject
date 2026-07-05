# StockVista — AI Agent Coding Rules

> These rules are specifically for AI coding assistants (GitHub Copilot, Cursor, Gemini, Claude, etc.)
> working on the StockVista codebase. Follow these rules in addition to `RULES.md`.

---

## 1. Read Before Writing

- **ALWAYS** read the existing file before modifying it
- **ALWAYS** understand the existing patterns in the codebase before generating new code
- **NEVER** assume a file structure — check `RULES.md` for the architecture
- **ALWAYS** check for existing utilities before creating new ones (avoid duplication)

---

## 2. Architecture Compliance

### Backend
```
✅ Route → Controller → Service → Model
❌ Route → Model (skipping layers)
❌ Business logic in routes
❌ HTTP concerns (req/res) in services
```

### Frontend
```
✅ Page → Service → API
❌ Page → axios.get() (inline API calls)
❌ Component → API call (except layout components)
```

### Example — Correct Pattern
```javascript
// routes/tradingIdeas.js
router.get('/', tradingIdeaController.getAll);

// controllers/tradingIdeaController.js
const getAll = catchAsync(async (req, res) => {
  const { sector, ideaType, page, limit } = req.query;
  const result = await tradingIdeaService.getAll({ sector, ideaType, page, limit });
  res.json({ success: true, data: result.ideas, pagination: result.pagination });
});

// services/tradingIdeaService.js (optional for simple CRUD)
const getAll = async (filters) => {
  const query = buildQuery(filters);
  const ideas = await TradingIdea.find(query).sort('-createdAt');
  return { ideas, pagination };
};
```

---

## 3. Code Style

### Formatting
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for JavaScript strings
- **Semicolons**: Always use semicolons
- **Trailing commas**: Use in multi-line objects/arrays
- **Max line length**: 100 characters (soft limit)

### Naming
- **Variables/Functions**: `camelCase` — `const tradingIdeas = [];`
- **Components**: `PascalCase` — `const StockCard = () => {}`
- **Constants**: `UPPER_SNAKE_CASE` — `const API_BASE_URL = '';`
- **Files**: `camelCase.js` for utilities, `PascalCase.js` for React components and models
- **CSS classes**: `kebab-case` — `.market-ticker-strip`

### Imports Order
```javascript
// 1. Node.js built-in modules
const path = require('path');

// 2. Third-party packages
const express = require('express');
const mongoose = require('mongoose');

// 3. Project modules (absolute paths)
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// 4. Relative imports
const TradingIdea = require('../models/TradingIdea');
```

---

## 4. Data & Content Rules

### Use Realistic Indian Market Data
- Stock symbols: Use real NSE/BSE symbols (RELIANCE, TCS, INFY, HDFCBANK, etc.)
- Company names: Use real company names (Reliance Industries, Tata Consultancy Services)
- Prices: Use realistic price ranges (₹100–₹5000 range for most stocks)
- Sectors: Banking, IT, Pharma, FMCG, Auto, Energy, Metal, Real Estate, Telecom, Infrastructure
- IPOs: Use realistic IPO data (price bands, lot sizes, subscription multiples)
- Currency: Always ₹ (INR), never $ (USD) unless explicitly about foreign markets

### Content Tone
- Professional and informative
- Educational, not advisory (include disclaimers)
- Use standard finance terminology (bull, bear, P/E ratio, market cap, etc.)

---

## 5. Error Handling

### Backend — ALWAYS use this pattern:
```javascript
// utils/catchAsync.js wraps all async controllers
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Throw ApiError for known errors
if (!tradingIdea) {
  throw new ApiError(404, 'Trading idea not found');
}

// NEVER do this:
// res.status(500).json({ error: err.message }); // ❌ Leaks internal errors
```

### Frontend — ALWAYS handle all states:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Render: loading spinner → error message → data
```

---

## 6. Component Rules (React)

### DO:
- Keep components focused and small (< 150 lines)
- Use descriptive prop names
- Handle loading, error, and empty states
- Include key prop on all list-rendered elements
- Use semantic HTML (`<article>`, `<section>`, `<nav>`, `<main>`)

### DON'T:
- Don't use inline styles (use Tailwind classes)
- Don't hardcode text that should be a constant
- Don't create components that do too many things
- Don't use `index` as key for dynamic lists
- Don't leave `console.log` statements in production code

---

## 7. API Endpoint Rules

### URL Patterns
```
GET    /api/resource          → List all (with pagination, filters)
GET    /api/resource/:id      → Get one by ID or slug
POST   /api/resource          → Create new (admin only)
PUT    /api/resource/:id      → Full update (admin only)
PATCH  /api/resource/:id      → Partial update (admin only)
DELETE /api/resource/:id      → Delete (admin only)
```

### Query Parameters for List Endpoints
```
?page=1          → Pagination page number
&limit=12        → Items per page
&search=keyword  → Text search
&sector=banking  → Filter by sector
&sort=-createdAt → Sort order (- prefix for descending)
&featured=true   → Filter by featured flag
```

### Response Shape — ALWAYS follow:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": { "page": 1, "limit": 12, "total": 100, "pages": 9 }
}
```

---

## 8. Security Rules for AI

1. **NEVER** generate code that hardcodes:
   - Database URIs or connection strings
   - JWT secrets or API keys
   - Admin passwords or credentials
   - Production URLs

2. **ALWAYS** use environment variables via `config/index.js`

3. **NEVER** trust client input — always validate on server

4. **NEVER** return sensitive fields in API responses:
   ```javascript
   // ✅ Correct
   const user = await User.findById(id).select('-password');
   
   // ❌ Wrong
   const user = await User.findById(id);
   res.json(user); // Leaks password hash!
   ```

---

## 9. Git Rules for AI

### Commit Messages
Follow conventional commits format:
```
feat: add IPO tracker page with status filters
fix: correct price formatting for large numbers
refactor: extract market ticker into separate component
docs: update API documentation for trading ideas
style: improve mobile responsiveness of stock cards
chore: update mongoose to v8
```

### What to commit:
- Source code changes
- Configuration files (not secrets)
- Documentation updates
- Test files

### What to NEVER commit:
- `.env` files (use `.env.example`)
- `node_modules/`
- `build/` directories
- `*.log` files
- IDE settings (`.vscode/`, `.idea/`)

---

## 10. Testing Guidelines

1. **API Tests**: Test each endpoint for:
   - Success case (200/201)
   - Validation error (400)
   - Not found (404)
   - Unauthorized (401)
   - Forbidden (403)

2. **Frontend**: Ensure each page:
   - Renders without errors
   - Handles loading state
   - Handles error state
   - Handles empty data state

---

## 11. Performance Rules

1. **Database Queries**:
   - Always use `.select()` to return only needed fields
   - Create indexes for fields used in queries/sorting
   - Use `.lean()` for read-only queries
   - Paginate all list endpoints (never return unbounded results)

2. **Frontend**:
   - Lazy load images
   - Use pagination (never load all data at once)
   - Minimize re-renders (use `React.memo` where beneficial)

---

## 12. Disclaimer Requirement

All pages showing stock prices, trading ideas, or financial advice MUST include:

```
Disclaimer: The information provided on StockVista is for educational and
informational purposes only. It should not be considered as financial advice.
Please consult a certified financial advisor before making investment decisions.
Stock market investments are subject to market risks.
```

This disclaimer should appear in the footer and on relevant detail pages.
