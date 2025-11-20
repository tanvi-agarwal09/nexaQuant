# neXaQuant - File Mapping Guide

This guide shows you exactly which code from the original document goes into which file.

## Quick Reference

| Artifact Name | Destination File |
|---------------|------------------|
| ohlc_loader_fix | `backend/src/app/services/ohlc_loader.py` |
| openrouter_adapter_fix | `backend/src/app/services/openrouter_adapter.py` |
| routes_mint_fixed | `backend/src/app/api/v1/routes_mint.py` |
| schemas_nft | `backend/src/app/schemas/nft.py` |
| nexaquant_frontend | `frontend/src/App.jsx` |
| env_example | `backend/.env.example` |
| readme_guide | `README.md` (root) |
| quick_start_script | `quickstart.sh` (root) |
| demo_script | `DEMO_SCRIPT.md` (root) |
| troubleshooting_guide | `TROUBLESHOOTING.md` (root) |
| pitch_deck_outline | `PITCH_DECK.md` (root) |
| complete_folder_structure | Reference only |
| file_mapping_guide | This document |

---

## Backend Files (from original document)

### Already Provided in Original Document:

#### `backend/scripts/seed_data.py`
```python
# Copy the code from original document section:
# backend/scripts/seed_data.py
```

#### `backend/scripts/start_dev.sh`
```bash
# Copy the code from original document section:
#!/usr/bin/env bash
# backend/scripts/start_dev.sh
```

#### `backend/src/app/agents/explainer_agent.py`
```python
# Copy from original document
```

#### `backend/src/app/agents/guru_agent.py`
```python
# Copy from original document
```

#### `backend/src/app/agents/strategy_agent.py`
```python
# Copy from original document
```

#### `backend/src/app/api/v1/__init__.py`
```python
# Copy from original document
from fastapi import APIRouter
api_router = APIRouter()
```

#### `backend/src/app/api/v1/router.py`
```python
# Copy from original document
```

#### `backend/src/app/api/v1/routes_backtest.py`
```python
# Copy from original document
```

#### `backend/src/app/api/v1/routes_guru.py`
```python
# Copy from original document
```

#### `backend/src/app/api/v1/routes_market.py`
```python
# Copy from original document
```

#### `backend/src/app/api/v1/routes_mint.py`
**⚠️ USE FIXED VERSION FROM ARTIFACT `routes_mint_fixed`**

#### `backend/src/app/api/dependencies.py`
```python
# Copy from original document
```

#### `backend/src/app/db/crud.py`
```python
# Copy from original document
```

#### `backend/src/app/db/database.py`
```python
# Copy from original document
```

#### `backend/src/app/models/__init__.py`
```python
# Copy from original document
```

#### `backend/src/app/models/agent_log.py`
```python
# Copy from original document
```

#### `backend/src/app/models/backtest.py`
```python
# Copy from original document
```

#### `backend/src/app/models/guru.py`
```python
# Copy from original document
```

#### `backend/src/app/models/nft.py`
```python
# Copy from original document
```

#### `backend/src/app/models/strategy.py`
```python
# Copy from original document
```

#### `backend/src/app/models/user.py`
```python
# Copy from original document
```

#### `backend/src/app/schema/__init__.py`
**Note: Original has typo - should be `schemas` not `schema`**
```python
# package marker
```

#### `backend/src/app/schema/backtest.py`
**⚠️ Should be in `schemas/` folder (note the 's')**
```python
# Copy from original document
```

#### `backend/src/app/schema/market.py`
**⚠️ Should be in `schemas/` folder**
```python
# Copy from original document
```

#### `backend/src/app/schema/nft.py`
**⚠️ USE FIXED VERSION FROM ARTIFACT `schemas_nft`**
Place in: `backend/src/app/schemas/nft.py`

#### `backend/src/app/services/backtest_engine.py`
```python
# Copy from original document
```

#### `backend/src/app/services/metrics.py`
```python
# Copy from original document
```

#### `backend/src/app/services/nft_metadata.py`
```python
# Copy from original document
```

#### `backend/src/app/services/ohlc_loader.py`
**⚠️ USE FIXED VERSION FROM ARTIFACT `ohlc_loader_fix`**

#### `backend/src/app/services/openrouter_adapter.py`
**⚠️ USE FIXED VERSION FROM ARTIFACT `openrouter_adapter_fix`**

#### `backend/src/app/services/solana_adapter.py`
```python
# Copy from original document
```

#### `backend/src/app/tasks/__init__.py`
```python
# simple tasks package
```

#### `backend/src/app/tasks/backtest_queue.py`
```python
# Copy from original document
```

#### `backend/src/app/__init__.py`
```python
# package marker for app
```

#### `backend/src/app/tests/__init__.py`
```python
# tests package
```

#### `backend/src/app/tests/test_backtest.py`
```python
# Copy from original document
```

#### `backend/src/app/tests/test_parsing_agent.py`
```python
# Copy from original document
```

#### `backend/src/app/config.py`
**⚠️ File name in document is wrong - listed as just `config.py`**
```python
# Copy from original document
# This is actually backend/src/app/config.py
```

#### `backend/src/app/main.py`
```python
# Copy from original document
```

#### `backend/docker-compose.backend.yml`
```yaml
# Copy from original document
```

#### `backend/README.md`
```markdown
# neXaQuant Backend (HackNYU MVP)
# Copy from original document
```

#### `backend/requirements.txt`
```
# Copy from original document
```

#### `backend/.env.example`
**⚠️ USE VERSION FROM ARTIFACT `env_example`**

---

## Frontend Files

### Main Application

#### `frontend/src/App.jsx`
**⚠️ USE VERSION FROM ARTIFACT `nexaquant_frontend`**

#### `frontend/src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

#### `frontend/src/App.css`
```css
/* Optional - most styling is in Tailwind classes */
.artifact-content {
  width: 100%;
  height: 100%;
}
```

#### `frontend/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>neXaQuant - AI-Powered Trading Intelligence</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### `frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

#### `frontend/package.json`
```json
{
  "name": "nexaquant-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

#### `frontend/tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### `frontend/postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `frontend/.gitignore`
```
# Dependencies
node_modules

# Build
dist
build

# Logs
npm-debug.log*
yarn-debug.log*

# Environment
.env
.env.local

# IDE
.vscode
.idea
```

---

## Root Directory Files

#### `README.md`
**⚠️ USE VERSION FROM ARTIFACT `readme_guide`**

#### `DEMO_SCRIPT.md`
**⚠️ USE VERSION FROM ARTIFACT `demo_script`**

#### `PITCH_DECK.md`
**⚠️ USE VERSION FROM ARTIFACT `pitch_deck_outline`**

#### `TROUBLESHOOTING.md`
**⚠️ USE VERSION FROM ARTIFACT `troubleshooting_guide`**

#### `quickstart.sh`
**⚠️ USE VERSION FROM ARTIFACT `quick_start_script`**

#### `.gitignore`
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
*.egg-info/
dist/
build/
.venv/
venv/

# Database
*.db
*.sqlite

# Environment
.env
.env.local

# Node
node_modules/
npm-debug.log*

# Build
dist/
build/

# IDEs
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Backtest results
backtests/
```

---

## Empty `__init__.py` Files

These files should exist but can be empty:

```
backend/src/__init__.py
backend/src/app/__init__.py
backend/src/app/agents/__init__.py
backend/src/app/api/__init__.py
backend/src/app/api/v1/__init__.py  # Actually has content, see above
backend/src/app/db/__init__.py
backend/src/app/schemas/__init__.py
backend/src/app/services/__init__.py
backend/src/app/tasks/__init__.py
backend/src/app/tests/__init__.py
```

---

## Critical Fixes Applied

### 1. **Schema Folder Name**
- Original document uses `schema/` 
- Should be `schemas/` (plural)
- Update all imports accordingly

### 2. **Fixed Files (Use Artifact Versions)**
- `ohlc_loader.py` - Fixed MultiIndex handling
- `openrouter_adapter.py` - Added fallback mock responses
- `routes_mint.py` - Added proper implementation
- `schemas/nft.py` - Added missing file

### 3. **New Dependencies**
Make sure `requirements.txt` includes:
```
fastapi>=0.95.0
uvicorn[standard]>=0.22.0
sqlalchemy>=1.4
pydantic>=2.12
pydantic-settings>=2.12
requests>=2.31
pandas>=2.0
numpy>=1.26
yfinance>=0.2
python-dotenv>=1.0
pytest>=7.3
base58>=2.1.1
```

---

## Installation Order

1. **Create folder structure** (use setup script from `complete_folder_structure`)
2. **Copy all files** using this mapping guide
3. **Backend setup:**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python scripts/seed_data.py
   ```
4. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   ```
5. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source .venv/bin/activate
   uvicorn src.app.main:app --reload

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## Verification Checklist

- [ ] All `__init__.py` files exist
- [ ] No typos in folder names (e.g., `schemas` not `schema`)
- [ ] All imports use correct paths
- [ ] `.env.example` copied to `.env` in backend
- [ ] Virtual environment activated before pip install
- [ ] Backend runs without errors on port 8000
- [ ] Frontend runs without errors on port 5173
- [ ] All API endpoints return responses (use /healthz to test)
- [ ] Frontend can connect to backend
- [ ] No CORS errors in browser console

---

## Quick Test Commands

```bash
# Test backend
curl http://localhost:8000/healthz
# Should return: {"status":"ok"}

# Test frontend
curl http://localhost:5173
# Should return HTML

# Test API from frontend
# Open http://localhost:5173 in browser
# Open DevTools Console (F12)
# Should see no CORS or network errors
```

---

## Common Issues

**Import errors:** Check folder is `schemas` not `schema`  
**ModuleNotFoundError:** Activate virtual environment first  
**CORS errors:** Check `BACKEND_CORS_ORIGINS` in `.env`  
**yfinance errors:** Use fixed `ohlc_loader.py` from artifacts  
**OpenRouter errors:** Leave `OPENROUTER_API_KEY` empty to use mocks  

---

This mapping ensures you have all code in the right place! 🚀