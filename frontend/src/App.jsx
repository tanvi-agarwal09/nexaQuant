import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, Brain, Bot, Coins, Sparkles, ChevronRight, AlertCircle, Trophy, Zap, Target, DollarSign, TrendingDown, Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function NeXaQuant() {
  const [activeTab, setActiveTab] = useState('strategy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Strategy State
  const [strategyText, setStrategyText] = useState('');
  const [ticker, setTicker] = useState('SPY');
  const [backtestResults, setBacktestResults] = useState(null);
  const [portfolioValue, setPortfolioValue] = useState(null);

  // Guru State
  const [guruSource, setGuruSource] = useState('generate');
  const [guruTranscript, setGuruTranscript] = useState('');
  const [guruDays, setGuruDays] = useState(90);
  const [guruResults, setGuruResults] = useState(null);
  const [guruPortfolioValue, setGuruPortfolioValue] = useState(null);

  // NFT State
  const [mintedNFT, setMintedNFT] = useState(null);
  const [mintAnimation, setMintAnimation] = useState(false);

  // Market Data State
  const [marketData, setMarketData] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);

  // Marketplace State
  const [marketplaceResults, setMarketplaceResults] = useState(null);
  const [showMarketplace, setShowMarketplace] = useState(false);

  const calculatePortfolioValue = (metrics, startingAmount = 1000) => {
    const cagr = metrics.cagr || 0;
    const years = 1; // Assume 1 year backtest
    const endValue = startingAmount * Math.pow(1 + cagr, years);
    const profit = endValue - startingAmount;
    const profitPercent = (profit / startingAmount) * 100;
    
    return {
      startValue: startingAmount,
      endValue: endValue,
      profit: profit,
      profitPercent: profitPercent
    };
  };

  const calculateMarketInsights = (ohlc) => {
    if (!ohlc || ohlc.length === 0) return null;
    
    const closes = ohlc.map(d => d.close);
    const volumes = ohlc.map(d => d.volume);
    
    // Calculate moving averages
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
    const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);
    
    // Calculate volatility (standard deviation)
    const returns = closes.slice(1).map((close, i) => (close - closes[i]) / closes[i]);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized
    
    // Trend detection
    const trend = closes[closes.length - 1] > sma50 ? 'Bullish' : 'Bearish';
    
    // Support and resistance (simplified)
    const high = Math.max(...closes);
    const low = Math.min(...closes);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate timeframe for period return
    const daysDiff = ohlc.length;
    let timeframeLabel = "Period";
    if (daysDiff >= 350) timeframeLabel = "Yearly";
    else if (daysDiff >= 80) timeframeLabel = "Quarterly";
    else if (daysDiff >= 25) timeframeLabel = "Monthly";
    else timeframeLabel = `${daysDiff}-Day`;
    
    return {
      sma20,
      sma50,
      volatility,
      trend,
      high,
      low,
      currentPrice,
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      priceChange: ((currentPrice - closes[0]) / closes[0]) * 100,
      timeframeLabel
    };
  };

  const runBacktest = async () => {
    if (!strategyText.trim()) {
      setError('Please enter a trading strategy');
      return;
    }

    setLoading(true);
    setError('');
    setBacktestResults(null);
    setPortfolioValue(null);

    try {
      const response = await fetch(`${API_BASE}/backtest/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description_text: strategyText,
          ticker: ticker || 'SPY',
          request_id: `strat_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backtest failed');
      }

      const data = await response.json();
      setBacktestResults(data);
      
      // Calculate portfolio value
      const portfolio = calculatePortfolioValue(data.metrics);
      setPortfolioValue(portfolio);
    } catch (err) {
      setError(err.message || 'Failed to run backtest');
    } finally {
      setLoading(false);
    }
  };

  const analyzeGuru = async () => {
    if (guruSource === 'paste' && !guruTranscript.trim()) {
      setError('Please enter a transcript');
      return;
    }

    setLoading(true);
    setError('');
    setGuruResults(null);
    setGuruPortfolioValue(null);

    try {
      const response = await fetch(`${API_BASE}/guru/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: guruSource,
          transcript_text: guruSource === 'paste' ? guruTranscript : null,
          guru_identifier: 'demo_guru',
          days: guruDays
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setGuruResults(data);
      
      // Calculate portfolio value from breakdown (if available) or samples
      if (data.breakdown && data.breakdown.profitability) {
        const portfolio = {
          startValue: 1000,
          endValue: data.breakdown.profitability.final_portfolio,
          profit: data.breakdown.profitability.absolute_profit,
          profitPercent: data.breakdown.profitability.total_return_pct
        };
        setGuruPortfolioValue(portfolio);
      } else if (data.samples && data.samples.length > 0) {
        // Fallback: calculate from samples
        const avgMetrics = {
          cagr: data.samples.reduce((sum, s) => sum + (s.cagr || 0), 0) / data.samples.length,
          sharpe: data.samples.reduce((sum, s) => sum + (s.sharpe || 0), 0) / data.samples.length
        };
        const portfolio = calculatePortfolioValue(avgMetrics);
        setGuruPortfolioValue(portfolio);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze guru');
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!backtestResults) {
      setError('Please run a backtest first');
      return;
    }

    setLoading(true);
    setError('');
    setMintAnimation(true);

    try {
      const response = await fetch(`${API_BASE}/mint/strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_id: backtestResults.backtest_id,
          owner_user_id: 'demo_user',
          ticker: ticker,
          metrics: backtestResults.metrics
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Minting failed');
      }

      const data = await response.json();
      
      // Delay to show animation
      setTimeout(() => {
        setMintedNFT(data);
        setMintAnimation(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to mint NFT');
      setMintAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  const runMarketplace = async () => {
    if (!backtestResults) {
      setError('Please run a backtest first to simulate marketplace');
      return;
    }

    setLoading(true);
    setError('');
    setMarketplaceResults(null);

    try {
      const response = await fetch(`${API_BASE}/marketplace/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_metadata: {
            name: `${ticker} Strategy`,
            metrics: backtestResults.metrics
          },
          buyer_budget: 1000,
          buyer_requirements: {
            min_sharpe: 1.0,
            max_drawdown: -0.15,
            min_cagr: 0.10
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Marketplace simulation failed');
      }

      const data = await response.json();
      setMarketplaceResults(data);
      setShowMarketplace(true);
    } catch (err) {
      setError(err.message || 'Failed to run marketplace simulation');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/market/ohlc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker || 'SPY' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load data');
      }

      const data = await response.json();
      setMarketData(data);
      
      // Calculate insights
      const insights = calculateMarketInsights(data.ohlc);
      setMarketInsights(insights);
    } catch (err) {
      setError(err.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { text: 'Elite', color: 'bg-purple-500', icon: Trophy };
    if (score >= 60) return { text: 'Advanced', color: 'bg-blue-500', icon: Zap };
    if (score >= 40) return { text: 'Intermediate', color: 'bg-green-500', icon: Target };
    return { text: 'Beginner', color: 'bg-gray-500', icon: Activity };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  neXaQuant
                </h1>
                <p className="text-sm text-purple-300">AI-Powered Trading Intelligence</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs border border-purple-500/30 animate-pulse">
                Multi-Agent AI
              </span>
              <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs border border-blue-500/30 animate-pulse">
                Solana NFTs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 bg-black/30 rounded-xl p-1 backdrop-blur-sm border border-purple-500/20">
          {[
            { id: 'strategy', label: 'Strategy Builder', icon: TrendingUp },
            { id: 'guru', label: 'Guru Analyzer', icon: Brain },
            { id: 'market', label: 'Market Data', icon: Coins },
            { id: 'nft', label: 'NFT Gallery', icon: Bot }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 scale-105'
                  : 'hover:bg-white/5 hover:scale-102'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-4 animate-fadeIn">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-300">Error</p>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Natural Language Strategy Builder
              </h2>
              <p className="text-purple-200 mb-6">
                Describe your trading strategy in plain English. Our AI will parse it, backtest it, and show you the results.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Strategy Description
                  </label>
                  <textarea
                    value={strategyText}
                    onChange={(e) => setStrategyText(e.target.value)}
                    placeholder="e.g., Buy SPY when 50-day SMA crosses above 200-day SMA. Sell when it crosses below."
                    className="w-full h-32 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="SPY"
                    className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                <button
                  onClick={runBacktest}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-purple-500/50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Running Backtest...
                    </>
                  ) : (
                    <>
                      Run Backtest
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {portfolioValue && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30 animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-300">
                  <DollarSign className="w-5 h-5" />
                  Portfolio Growth (Starting with $1,000)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Starting Value</p>
                    <p className="text-2xl font-bold text-white">${portfolioValue.startValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Ending Value</p>
                    <p className="text-2xl font-bold text-green-400">${portfolioValue.endValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Profit</p>
                    <p className="text-2xl font-bold text-green-400">+${portfolioValue.profit.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Return</p>
                    <p className="text-2xl font-bold text-green-400">+{portfolioValue.profitPercent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {backtestResults && (
              <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Backtest Results</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'CAGR', value: `${(backtestResults.metrics.cagr * 100).toFixed(2)}%`, color: 'text-green-400', icon: TrendingUp },
                    { label: 'Sharpe Ratio', value: backtestResults.metrics.sharpe.toFixed(2), color: 'text-blue-400', icon: Target },
                    { label: 'Max Drawdown', value: `${(backtestResults.metrics.max_drawdown * 100).toFixed(2)}%`, color: 'text-red-400', icon: TrendingDown },
                    { label: 'Volatility', value: `${(backtestResults.metrics.volatility * 100).toFixed(2)}%`, color: 'text-yellow-400', icon: Activity }
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-500/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-purple-300" />
                        <p className="text-sm text-purple-300">{label}</p>
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={mintNFT}
                    disabled={loading || mintAnimation}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 rounded-lg px-4 py-2 font-medium transition-all duration-300 hover:scale-105"
                  >
                    {mintAnimation ? 'Minting...' : 'Mint as NFT on Solana'}
                  </button>
                  <button
                    onClick={runMarketplace}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg px-4 py-2 font-medium transition-all duration-300 hover:scale-105"
                  >
                    Simulate Agent Marketplace
                  </button>
                </div>
              </div>
            )}

            {mintAnimation && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-8 border border-purple-500/30 animate-fadeIn">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">Minting Your Strategy NFT...</h3>
                  <p className="text-purple-200 text-center">Creating unique token on Solana blockchain</p>
                </div>
              </div>
            )}

            {mintedNFT && !mintAnimation && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30 animate-fadeIn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      NFT Minted Successfully!
                    </h3>
                    <p className="text-lg font-semibold text-purple-300">{mintedNFT.strategy_name}</p>
                  </div>
                </div>
                <p className="text-purple-200 mb-4">{mintedNFT.strategy_description}</p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-2">
                  <div>
                    <p className="text-purple-300">Mint Address:</p>
                    <p className="text-white break-all">{mintedNFT.mint_address}</p>
                  </div>
                  <div>
                    <p className="text-purple-300">Network:</p>
                    <p className="text-white">{mintedNFT.network}</p>
                  </div>
                </div>
              </div>
            )}

            {showMarketplace && marketplaceResults && (
              <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300">
                  <Bot className="w-6 h-6" />
                  Agent Marketplace Simulation Results
                </h3>
                
                {/* Buyer Strategy Summary */}
                {marketplaceResults.buyer_strategy && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-5 mb-6 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Buyer Agent Strategy
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-200 mb-1">Budget</p>
                        <p className="text-white font-semibold">${marketplaceResults.buyer_strategy.initial_budget}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 mb-1">Strategy Score</p>
                        <p className="text-white font-semibold">{marketplaceResults.buyer_strategy.strategy_evaluation}/100</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-blue-200 mb-1">Requirements</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(marketplaceResults.buyer_strategy.requirements).map(([key, val]) => (
                            <span key={key} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                              {key}: {typeof val === 'number' ? val.toFixed(2) : val}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-blue-200 mb-1">Approach</p>
                        <p className="text-white text-xs">{marketplaceResults.buyer_strategy.negotiation_approach}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Summary */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-6 border border-purple-500/30">
                  <p className="font-semibold text-purple-300 mb-2">Negotiation Summary:</p>
                  <p className="text-white mb-3">{marketplaceResults.summary}</p>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-purple-300 text-xs">Total Rounds</p>
                      <p className="text-2xl font-bold text-white">{marketplaceResults.total_rounds || 0}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Sellers Contacted</p>
                      <p className="text-2xl font-bold text-white">{marketplaceResults.sellers_contacted || 3}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Deals Closed</p>
                      <p className="text-2xl font-bold text-green-400">{marketplaceResults.deals_successful || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Best Deal Highlight */}
                {marketplaceResults.best_deal && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-5 mb-6 border border-green-500/30">
                    <h4 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Best Deal Achieved
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-green-200 mb-1">Seller</p>
                        <p className="text-white font-semibold">{marketplaceResults.best_deal.seller_id}</p>
                      </div>
                      <div>
                        <p className="text-green-200 mb-1">Final Price</p>
                        <p className="text-white font-semibold">${marketplaceResults.best_deal.final_price?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-200 mb-1">Saved</p>
                        <p className="text-green-400 font-semibold">${marketplaceResults.best_deal.savings?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-200 mb-1">Discount</p>
                        <p className="text-green-400 font-semibold">{marketplaceResults.best_deal.discount_percent?.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Negotiations */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-300">Detailed Negotiations</h4>
                  {marketplaceResults.all_negotiations.map((neg, idx) => (
                    <div key={idx} className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="font-semibold text-purple-300">{neg.seller_id}</span>
                          <span className="ml-2 px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                            {neg.personality}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          neg.outcome === 'deal_accepted' ? 'bg-green-500/20 text-green-300' : 
                          neg.outcome === 'deal_rejected' ? 'bg-red-500/20 text-red-300' :
                          neg.outcome === 'buyer_walked_away' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {neg.outcome.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <span className="text-purple-300">Starting Ask:</span>
                          <span className="text-white ml-2 font-semibold">${neg.starting_ask?.toFixed(2)}</span>
                        </div>
                        {neg.final_price && (
                          <div>
                            <span className="text-purple-300">Final Price:</span>
                            <span className="text-green-400 ml-2 font-semibold">${neg.final_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <details className="mt-3">
                        <summary className="text-sm text-purple-300 cursor-pointer hover:text-purple-200 flex items-center gap-2">
                          <ChevronRight className="w-3 h-3" />
                          View {neg.rounds.length} negotiation rounds
                        </summary>
                        <div className="mt-3 space-y-2">
                          {neg.rounds.map((round, ridx) => (
                            <div key={ridx} className="pl-4 border-l-2 border-purple-500/30 py-2">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    round.actor === 'buyer' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'
                                  }`}>
                                    {round.actor === 'buyer' ? '🤖 Buyer' : '🏪 Seller'}
                                  </span>
                                  <span className="text-xs text-purple-400">Round {round.round}</span>
                                </div>
                                {round.price && (
                                  <span className="text-xs font-semibold text-white">${round.price.toFixed(2)}</span>
                                )}
                              </div>
                              <p className="text-xs text-purple-200 mt-1">
                                <span className="font-semibold">{round.action}:</span> {round.reasoning}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guru' && (
          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Guru Performance Analyzer
              </h2>
              <p className="text-purple-200 mb-6">
                Analyze trading gurus' performance by extracting calls from transcripts or generating sample data.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setGuruSource('generate')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      guruSource === 'generate'
                        ? 'bg-purple-600 shadow-lg scale-105'
                        : 'bg-black/50 border border-purple-500/30 hover:bg-white/5 hover:scale-102'
                    }`}
                  >
                    Generate Sample Calls
                  </button>
                  <button
                    onClick={() => setGuruSource('paste')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      guruSource === 'paste'
                        ? 'bg-purple-600 shadow-lg scale-105'
                        : 'bg-black/50 border border-purple-500/30 hover:bg-white/5 hover:scale-102'
                    }`}
                  >
                    Paste Transcript
                  </button>
                </div>

                {guruSource === 'paste' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">
                      Transcript Text
                    </label>
                    <textarea
                      value={guruTranscript}
                      onChange={(e) => setGuruTranscript(e.target.value)}
                      placeholder="Paste trading guru's transcript here..."
                      className="w-full h-32 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>
                )}

                {guruSource === 'generate' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">
                      Days to Simulate
                    </label>
                    <input
                      type="number"
                      value={guruDays}
                      onChange={(e) => setGuruDays(parseInt(e.target.value) || 90)}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 focus:scale-[1.01]"
                    />
                  </div>
                )}

                <button
                  onClick={analyzeGuru}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Guru Performance
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {guruPortfolioValue && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30 animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-300">
                  <DollarSign className="w-5 h-5" />
                  Portfolio if You Followed This Guru (Starting with $1,000)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Starting Value</p>
                    <p className="text-2xl font-bold text-white">${guruPortfolioValue.startValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Ending Value</p>
                    <p className="text-2xl font-bold text-green-400">${guruPortfolioValue.endValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Profit</p>
                    <p className={`text-2xl font-bold ${guruPortfolioValue.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {guruPortfolioValue.profit >= 0 ? '+' : ''}${guruPortfolioValue.profit.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <p className="text-sm text-green-300 mb-1">Return</p>
                    <p className={`text-2xl font-bold ${guruPortfolioValue.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {guruPortfolioValue.profit >= 0 ? '+' : ''}{guruPortfolioValue.profitPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {guruResults && (
              <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Guru Analysis Results</h3>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 mb-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-purple-300 mb-1">Overall Score</p>
                      <p className="text-5xl font-bold text-white">{guruResults.score}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {(() => {
                        const badge = getScoreBadge(guruResults.score);
                        const BadgeIcon = badge.icon;
                        return (
                          <>
                            <div className={`px-4 py-2 rounded-full ${badge.color} font-bold flex items-center gap-2`}>
                              <BadgeIcon className="w-4 h-4" />
                              {badge.text}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${guruResults.score}%` }}
                    />
                  </div>
                </div>

                {/* Score Breakdown */}
                {guruResults.breakdown && (
                  <div className="bg-black/50 rounded-lg p-5 mb-6 border border-purple-500/20">
                    <h4 className="font-semibold text-purple-300 mb-4">Score Breakdown</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-300 text-sm font-medium">💰 Profitability</span>
                          <span className="text-white font-bold">
                            {guruResults.breakdown.profitability?.score || 0}/40
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-green-200">
                          <p>Total Return: {guruResults.breakdown.profitability?.total_return_pct?.toFixed(2)}%</p>
                          <p>Profit: ${guruResults.breakdown.profitability?.absolute_profit?.toFixed(2)}</p>
                          <p>Final: ${guruResults.breakdown.profitability?.final_portfolio?.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-300 text-sm font-medium">📊 Risk-Adjusted</span>
                          <span className="text-white font-bold">
                            {guruResults.breakdown.risk_adjusted?.score || 0}/30
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-blue-200">
                          <p>Avg Sharpe: {guruResults.breakdown.risk_adjusted?.avg_sharpe?.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 text-sm font-medium">🎯 Consistency</span>
                          <span className="text-white font-bold">
                            {guruResults.breakdown.consistency?.score || 0}/20
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-purple-200">
                          <p>Win Rate: {guruResults.breakdown.consistency?.win_rate?.toFixed(1)}%</p>
                          <p>Wins: {guruResults.breakdown.consistency?.wins}/{guruResults.breakdown.consistency?.total_trades}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-orange-300 text-sm font-medium">🛡️ Risk Management</span>
                          <span className="text-white font-bold">
                            {guruResults.breakdown.risk_management?.score || 0}/10
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-orange-200">
                          <p>Avg Max DD: {guruResults.breakdown.risk_management?.avg_max_drawdown_pct?.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-300">Detailed Trade Analysis</h4>
                  <div className="grid gap-3">
                    {guruResults.detailed_calls && guruResults.detailed_calls.length > 0 ? (
                      guruResults.detailed_calls.map((call, idx) => (
                        <div key={idx} className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-[1.02]">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-sm font-semibold text-purple-300">Trade #{call.trade_number}</span>
                              <span className="text-xs text-purple-400 ml-2 font-mono bg-purple-500/20 px-2 py-1 rounded">
                                {call.ticker}
                              </span>
                              <span className="text-xs text-purple-400 ml-2">
                                {call.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                call.action === 'buy' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {call.action.toUpperCase()}
                              </span>
                              <span className="text-xs text-purple-300">
                                Confidence: {(call.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mb-2 text-sm">
                            <div className="flex gap-4">
                              <span className={`${call.metrics.sharpe >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                Sharpe: {call.metrics.sharpe?.toFixed(2) || 'N/A'}
                              </span>
                              <span className={`${call.metrics.cagr >= 0.1 ? 'text-green-400' : call.metrics.cagr >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                CAGR: {((call.metrics.cagr || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                            {call.entry_price > 0 && (
                              <div className="text-xs text-purple-300">
                                Entry: ${call.entry_price.toFixed(2)}
                                {call.target_price && ` → Target: ${call.target_price.toFixed(2)}`}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-purple-300 mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded ${call.is_profitable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                              {call.is_profitable ? '✓ Profitable' : '✗ Loss'}
                            </span>
                            <span>Max DD: {((call.metrics.max_drawdown || 0) * 100).toFixed(1)}%</span>
                            <span>Vol: {((call.metrics.volatility || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))
                    ) : guruResults.samples && guruResults.samples.length > 0 ? (
                      // Fallback for old format
                      guruResults.samples.slice(0, 8).map((sample, idx) => (
                        <div key={idx} className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-[1.02]">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-sm font-semibold text-purple-300">Trade #{idx + 1}</span>
                              <span className="text-xs text-purple-400 ml-2">
                                {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'AMZN'][idx % 8]}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span className={`${sample.sharpe >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                                Sharpe: {sample.sharpe?.toFixed(2) || 'N/A'}
                              </span>
                              <span className={`${sample.cagr >= 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                                CAGR: {((sample.cagr || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-purple-300 mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 rounded ${sample.cagr >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                              {sample.cagr >= 0 ? '✓ Profitable' : '✗ Loss'}
                            </span>
                            <span>Max DD: {((sample.max_drawdown || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-purple-300 text-sm">No trade data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Coins className="w-6 h-6 text-purple-400" />
                Market Data Explorer
              </h2>
              <p className="text-purple-200 mb-6">
                Load and visualize historical OHLC data with technical insights for any ticker.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="SPY"
                    className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>

                <button
                  onClick={loadMarketData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load Market Data
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {marketInsights && (
              <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Technical Insights</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className={`bg-black/50 rounded-lg p-4 border ${marketInsights.trend === 'Bullish' ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <p className="text-sm text-purple-300 mb-1">Trend</p>
                    <p className={`text-2xl font-bold ${marketInsights.trend === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}>
                      {marketInsights.trend}
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300 mb-1">20-Day SMA</p>
                    <p className="text-2xl font-bold text-blue-400">${marketInsights.sma20.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300 mb-1">50-Day SMA</p>
                    <p className="text-2xl font-bold text-cyan-400">${marketInsights.sma50.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300 mb-1">Volatility (Annual)</p>
                    <p className="text-2xl font-bold text-yellow-400">{marketInsights.volatility.toFixed(1)}%</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300 mb-1">52W High</p>
                    <p className="text-2xl font-bold text-green-400">${marketInsights.high.toFixed(2)}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300 mb-1">52W Low</p>
                    <p className="text-2xl font-bold text-red-400">${marketInsights.low.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="font-semibold mb-2 text-purple-300">Performance</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">Period Return ({marketInsights.timeframeLabel}):</span>
                    <span className={`text-xl font-bold ${marketInsights.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketInsights.priceChange >= 0 ? '+' : ''}{marketInsights.priceChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-purple-200">Avg Daily Volume:</span>
                    <span className="text-xl font-bold text-white">
                      {(marketInsights.avgVolume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            )}

            {marketData && (
              <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm animate-fadeIn">
                <h3 className="text-xl font-bold mb-4 text-purple-300">
                  {marketData.ticker} - Price History
                </h3>
                
                <div className="bg-black/50 rounded-lg p-4 mb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={marketData.ohlc.slice(-90)}>
                      <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Area type="monotone" dataKey="close" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClose)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {marketData.ohlc.length > 0 && (
                    <>
                      <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-sm text-purple-300 mb-1">Latest Close</p>
                        <p className="text-xl font-bold text-white">
                          ${marketData.ohlc[marketData.ohlc.length - 1].close.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-sm text-purple-300 mb-1">Data Points</p>
                        <p className="text-xl font-bold text-white">{marketData.ohlc.length}</p>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-sm text-purple-300 mb-1">Latest Volume</p>
                        <p className="text-xl font-bold text-white">
                          {(marketData.ohlc[marketData.ohlc.length - 1].volume / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
                        <p className="text-sm text-purple-300 mb-1">Day Range</p>
                        <p className="text-xs text-white">
                          ${marketData.ohlc[marketData.ohlc.length - 1].low.toFixed(2)} - ${marketData.ohlc[marketData.ohlc.length - 1].high.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nft' && (
          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-400" />
                NFT Strategy Gallery
              </h2>
              <p className="text-purple-200 mb-6">
                Mint your backtested strategies as NFTs on Solana. Each NFT contains strategy code, performance metrics, and is tradeable on-chain.
              </p>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/30">
                <h3 className="font-semibold mb-3 text-purple-300">How It Works</h3>
                <ol className="space-y-2 text-sm text-purple-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-400">1.</span>
                    <span>Create and backtest your trading strategy in the Strategy Builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-400">2.</span>
                    <span>Review performance metrics (Sharpe, CAGR, drawdown)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-400">3.</span>
                    <span>Click "Mint as NFT" to create a Solana NFT with your strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-400">4.</span>
                    <span>NFT metadata includes code, metrics, and strategy parameters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-400">5.</span>
                    <span>Trade strategies on-chain or use in Agent Marketplace simulations</span>
                  </li>
                </ol>
              </div>

              {mintedNFT && (
                <div className="mt-6 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-xl p-6 border-2 border-purple-500/40 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{mintedNFT.strategy_name}</h3>
                        <p className="text-purple-300">{mintedNFT.strategy_description}</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500/20 rounded-full border border-green-500/40">
                      <span className="text-green-300 font-bold">Minted ✓</span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                      <p className="text-sm text-purple-300 mb-1">Mint Address</p>
                      <p className="text-xs text-white font-mono break-all">{mintedNFT.mint_address}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                      <p className="text-sm text-purple-300 mb-1">Network</p>
                      <p className="text-sm text-white font-semibold">{mintedNFT.network}</p>
                    </div>
                  </div>

                  {mintedNFT.metadata && mintedNFT.metadata.attributes && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {mintedNFT.metadata.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                          <p className="text-xs text-purple-300 mb-1">{attr.trait_type}</p>
                          <p className="text-sm font-bold text-white">
                            {typeof attr.value === 'number' ? attr.value.toFixed(2) : attr.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 text-purple-300">Tech Stack Highlights</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-105">
                  <h4 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Multi-Agent AI System
                  </h4>
                  <p className="text-sm text-purple-200">
                    OpenRouter powers multiple specialized AI agents for parsing strategies, analyzing gurus, and generating insights.
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-105">
                  <h4 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Solana Integration
                  </h4>
                  <p className="text-sm text-purple-200">
                    Mint strategy NFTs on Solana devnet with full metadata including code and performance metrics.
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-105">
                  <h4 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Backtest Engine
                  </h4>
                  <p className="text-sm text-purple-200">
                    Custom pandas-based backtesting with real Yahoo Finance data for accurate historical simulations.
                  </p>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:scale-105">
                  <h4 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Agent Marketplace
                  </h4>
                  <p className="text-sm text-purple-200">
                    Autonomous buyer and seller agents negotiate strategy purchases using LLM-powered decision making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-purple-500/20">
        <div className="text-center text-purple-300 text-sm">
          <p className="mb-2">Built for HackNYU 2025 - FinTech Track</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Aristotle AI Agent Challenge</span>
            <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">OpenRouter Challenge</span>
            <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Solana Best Use</span>
            <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Visa Agent Marketplace</span>
            <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">MLH - Best .Tech Domain Name</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}