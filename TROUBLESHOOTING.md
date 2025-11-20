# neXaQuant Troubleshooting Guide

## Common Issues and Solutions

### Backend Issues

#### 1. `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
source .venv/bin/activate  # Make sure venv is activated
pip install -r requirements.txt
```

#### 2. OpenRouter API Connection Error

**Symptoms:**
```
requests.exceptions.ConnectionError: HTTPSConnectionPool... Failed to resolve 'api.openrouter.ai'
```

**Solutions:**
- **Option A (Recommended for Demo)**: Leave `OPENROUTER_API_KEY` empty in `.env`. The system will automatically use mock responses.
- **Option B**: Check your internet connection and DNS
- **Option C**: Get a free API key at https://openrouter.ai/ and add to `.env`

#### 3. Database/Table Not Found

**Solution:**
```bash
cd backend
rm nexaquant.db  # Delete old database
python scripts/seed_data.py
uvicorn src.app.main:app --reload
```

The database will be recreated automatically on startup.

#### 4. CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' has been blocked by CORS
```

**Solution:**
Check `backend/.env`:
```bash
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

Make sure the frontend URL matches your dev server.

#### 5. Yahoo Finance Data Error: 'tuple' object has no attribute 'lower'

**Status:** ✅ FIXED in updated `ohlc_loader.py`

The fix handles MultiIndex columns from yfinance properly.

### Frontend Issues

#### 1. `npm install` Fails

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Vite Port Already in Use

**Solution:**
```bash
# Kill process on port 5173
# On macOS/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- --port 3000
```

#### 3. React Component Not Rendering

**Check:**
- Browser console for errors
- Ensure backend is running (`http://localhost:8000/healthz` should return `{"status":"ok"}`)
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### API Issues

#### 1. Backtest Endpoint Returns "Internal Server Error"

**Debug Steps:**
```bash
# Check backend logs in terminal
# Look for Python traceback

# Test endpoint directly:
curl -X POST http://localhost:8000/api/v1/backtest/run \
  -H "Content-Type: application/json" \
  -d '{"description_text":"Buy SPY","ticker":"SPY"}'
```

**Common causes:**
- Missing API key (use mock mode)
- Invalid ticker symbol
- Network timeout

#### 2. Market Data Returns 400 Error

**Cause:** Usually yfinance returns no data

**Solution:**
- Try a different ticker (SPY, AAPL, MSFT are reliable)
- Check ticker format: `AAPL` not `AAPL.US`
- For crypto: `BTC-USD` not `BTCUSD`

#### 3. Guru Analyze Hangs

**Cause:** LLM API timeout

**Solution:**
- Use "Generate Sample Calls" mode (faster, works offline)
- Reduce `days` parameter (try 30 instead of 90)
- Check network connection

### Performance Issues

#### 1. Backtest Takes Too Long

**Optimization:**
```python
# In ohlc_loader.py, reduce date range for testing:
start = (datetime.date.today() - datetime.timedelta(days=365)).isoformat()  # 1 year instead of 5
```

#### 2. Frontend Feels Slow

**Quick fixes:**
- Reduce chart data points (use `.slice(-90)` instead of full dataset)
- Add loading skeletons
- Enable production build: `npm run build && npm run preview`

### Deployment Issues

#### 1. Deploying to Render/Railway

**Backend (render.yaml):**
```yaml
services:
  - type: web
    name: nexaquant-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        value: sqlite:///./nexaquant.db
      - key: OPENROUTER_API_KEY
        sync: false
```

**Frontend (Vercel/Netlify):**
- Update `API_BASE` in `App.jsx` to your deployed backend URL
- Add backend URL to `BACKEND_CORS_ORIGINS`

#### 2. Database Persistence

**Issue:** SQLite gets wiped on Render/Railway restarts

**Solutions:**
- Use Render's persistent disk
- Migrate to PostgreSQL for production:
  ```bash
  pip install psycopg2-binary
  # Update DATABASE_URL to postgres://...
  ```

### Testing Issues

#### 1. "Demo doesn't work without internet"

**Fix:** The app is designed to work offline with mock responses!

Just ensure `OPENROUTER_API_KEY` is empty or not set in `.env`.

#### 2. NFT Minting Returns Fake Address

**This is intentional!** The MVP uses mock Solana minting for demo purposes.

For real minting, you need:
```bash
SOLANA_WALLET_PRIVATE_KEY=your_keypair_here
```

And implement actual Metaplex integration (beyond MVP scope).

## Quick Diagnostic

Run this to check your setup:

```bash
#!/bin/bash
echo "🔍 neXaQuant Diagnostic"
echo "======================="

# Backend checks
echo -n "Backend .env exists: "
[ -f "backend/.env" ] && echo "✅" || echo "❌"

echo -n "Backend venv exists: "
[ -d "backend/.venv" ] && echo "✅" || echo "❌"

echo -n "Backend database exists: "
[ -f "backend/nexaquant.db" ] && echo "✅" || echo "❌"

echo -n "Backend running: "
curl -s http://localhost:8000/healthz > /dev/null && echo "✅" || echo "❌"

# Frontend checks
echo -n "Frontend node_modules: "
[ -d "frontend/node_modules" ] && echo "✅" || echo "❌"

echo -n "Frontend running: "
curl -s http://localhost:5173 > /dev/null && echo "✅" || echo "❌"

echo ""
echo "If any ❌, refer to setup instructions in README.md"
```

## Emergency Reset

If everything is broken:

```bash
#!/bin/bash
# Nuclear option - reset everything

echo "🔄 Resetting neXaQuant..."

# Backend
cd backend
rm -rf .venv nexaquant.db backtests/
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/seed_data.py

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json .vite
npm install

echo "✅ Reset complete. Start both servers."
```

## Getting Help

### During Hackathon

1. **Check logs:** Backend terminal shows Python errors, frontend shows React errors
2. **Test API directly:** Use curl or Postman to test endpoints
3. **Use mock mode:** Disable API keys to use offline fallbacks
4. **Simplify:** Comment out complex features, get basics working first

### Debug Mode

Add to `backend/.env`:
```bash
DEBUG=1
LOG_LEVEL=DEBUG
```

### Still Stuck?

**Check these files:**
- `backend/src/app/main.py` - Is CORS configured?
- `backend/src/app/services/openrouter_adapter.py` - Is fallback working?
- `frontend/src/App.jsx` - Is `API_BASE` correct?

**Common gotchas:**
- Virtual environment not activated
- Wrong Python version (need 3.9+)
- Port conflicts (8000 or 5173 in use)
- Firewall blocking requests

## Pro Tips

### For Demo Day

1. **Pre-load data:** Run a backtest before presenting
2. **Use mock mode:** More reliable than API calls
3. **Have backup:** Screenshots of working features
4. **Test on venue WiFi:** Hotel internet can be flaky
5. **Mobile hotspot:** Ultimate backup plan

### For Judging

1. **Show logs:** Judges love seeing real-time processing
2. **Explain fallbacks:** "We have mock mode for reliability"
3. **Admit limitations:** "This is MVP scope, production would use..."
4. **Be confident:** "It works, let me show you"

## Contact

If you're a judge and something isn't working during demo, we likely have a backup recording or can explain the intended behavior. This is a hackathon MVP built in 48 hours - we know it's not perfect! 😊