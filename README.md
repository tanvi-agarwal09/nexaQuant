# neXaQuant - AI-Powered Trading Intelligence Platform

**Built for HackNYU 2025 | FinTech Track**

A multi-agent AI system that converts natural language trading strategies into backtested results, analyzes trading guru performance, and mints strategy NFTs on Solana.

## 🏆 Sponsor Challenges

- **Aristotle AI Agent Challenge**: Multi-agent system with specialized agents for parsing, backtesting, and analysis
- **OpenRouter Challenge**: Multi-model routing across GPT-4, Claude, and Llama
- **Solana Best Use**: Strategy NFT minting with on-chain metadata
- **Visa Agent Marketplace**: Autonomous buyer/seller agent negotiations
- **MLH .Tech Domain**: neXaQuant.tech

## 🚀 Features

### 1. Natural Language Strategy Builder
- Describe trading strategies in plain English
- AI parses and generates executable trading signals
- Comprehensive backtesting with real market data
- Performance metrics: Sharpe, CAGR, drawdown, volatility

### 2. Guru Performance Analyzer
- Extract trading calls from transcripts or generate samples
- Backtest each guru call individually
- Aggregate performance scoring with badge system
- Transparent accountability for trading influencers

### 3. Market Data Explorer
- Real-time OHLC data via Yahoo Finance
- Interactive charting and visualization
- Support for stocks, ETFs, and crypto

### 4. NFT Strategy Marketplace
- Mint successful strategies as Solana NFTs
- On-chain metadata includes code and metrics
- Future: Agent-to-agent strategy trading

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy + SQLite
- OpenRouter (multi-model AI routing)
- yfinance (market data)
- Pandas (backtesting engine)

**Frontend:**
- React + Vite
- Tailwind CSS
- Recharts (visualization)
- Lucide Icons

**Blockchain:**
- Solana (devnet)
- SPL Token standard
- Metaplex metadata

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip and npm/yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY (optional)

# Initialize database
python scripts/seed_data.py

# Start backend server
bash scripts/start_dev.sh
# Or directly: uvicorn src.app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🎮 Usage

### 1. Strategy Backtesting

1. Navigate to **Strategy Builder** tab
2. Enter a natural language strategy:
   ```
   Buy SPY when 50-day SMA crosses above 200-day SMA. 
   Sell when it crosses below.
   ```
3. Click **Run Backtest**
4. View performance metrics
5. (Optional) Click **Mint as NFT** to create Solana NFT

### 2. Guru Analysis

1. Navigate to **Guru Analyzer** tab
2. Choose **Generate Sample Calls** or **Paste Transcript**
3. For generation: Set number of days to simulate
4. For transcript: Paste trading guru's content
5. Click **Analyze Guru Performance**
6. View aggregated score and badge tier

### 3. Market Data

1. Navigate to **Market Data** tab
2. Enter ticker symbol (e.g., SPY, AAPL, BTC-USD)
3. Click **Load Market Data**
4. View historical price chart and statistics

### 4. NFT Minting

1. After running a backtest, go to **NFT Minting** tab
2. Review how NFT minting works
3. Mint directly from Strategy Builder results
4. View mint address and network (devnet)

## 🤖 Multi-Agent Architecture

### Agents Overview

1. **ParsingAgent**: Converts NL → structured strategy JSON
2. **BacktestAgent**: Executes strategy against historical data
3. **RiskAgent**: Computes risk metrics (Sharpe, drawdown, VaR)
4. **ScoringAgent**: Normalizes metrics to 0-100 score
5. **GuruCallExtractionAgent**: Extracts discrete trading calls
6. **MarketplaceAgents**: Buyer/seller negotiation (planned)

### OpenRouter Integration

The system uses OpenRouter for multi-model AI routing:
- **GPT-4o-mini**: Strategy parsing and guru extraction
- **Fallback Mode**: If no API key, uses mock responses for demo

## 📊 API Endpoints

```
POST /api/v1/backtest/run
GET  /api/v1/backtest/{id}/status
POST /api/v1/guru/analyze
POST /api/v1/market/ohlc
POST /api/v1/mint/strategy
GET  /api/v1/healthz
```

## 🔐 Environment Variables

```bash
# Required
DATABASE_URL=sqlite:///./nexaquant.db
BACKEND_CORS_ORIGINS=["http://localhost:5173"]

# Optional (system works without these)
OPENROUTER_API_KEY=your_key_here
SOLANA_WALLET_PRIVATE_KEY=your_key_here
```

**Note**: The app works fully in demo mode without API keys using mock responses!

## 🚧 Known Limitations (MVP)

- Backtest engine uses simple daily signals (no intraday)
- Mock Solana minting (devnet addresses are fake for demo)
- No user authentication (single-user demo)
- Limited strategy complexity (basic indicators only)
- Guru analysis uses simplified metrics

## 🎯 Future Enhancements

- [ ] Real Solana NFT minting with Metaplex
- [ ] Agent marketplace with real negotiations
- [ ] More sophisticated backtesting (intraday, options)
- [ ] User authentication and strategy library
- [ ] Monte Carlo simulations
- [ ] Live paper trading
- [ ] Social features (share strategies, follow gurus)

## 🏗️ Project Structure

```
nexaquant/
├── backend/
│   ├── src/app/
│   │   ├── agents/          # AI agent implementations
│   │   ├── api/v1/          # API routes
│   │   ├── db/              # Database models & CRUD
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI app
│   ├── scripts/             # Utility scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.jsx          # Main app
│   └── package.json
└── README.md
```

## 🤝 Contributing

This is a hackathon project, but suggestions are welcome!

## 📄 License

MIT License - Built for educational purposes at HackNYU 2025

## 👥 Team

[Your Team Name]
- Tanvi Agarwal
- Gaurav Poddar


## 🙏 Acknowledgments

- HackNYU 2025 organizers
- Aristotle for the AI Agent Challenge
- OpenRouter for multi-model API access
- Visa for the Agent Marketplace Challenge
- MLH and Solana for blockchain infrastructure

---

**Built with ❤️ at HackNYU 2025**
