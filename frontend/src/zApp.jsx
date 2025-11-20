// import React, { useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
// import { TrendingUp, Brain, Bot, Coins, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';

// const API_BASE = 'http://localhost:8000/api/v1';

// export default function NeXaQuant() {
//   const [activeTab, setActiveTab] = useState('strategy');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Strategy State
//   const [strategyText, setStrategyText] = useState('');
//   const [ticker, setTicker] = useState('SPY');
//   const [backtestResults, setBacktestResults] = useState(null);

//   // Guru State
//   const [guruSource, setGuruSource] = useState('generate');
//   const [guruTranscript, setGuruTranscript] = useState('');
//   const [guruDays, setGuruDays] = useState(90);
//   const [guruResults, setGuruResults] = useState(null);

//   // NFT State
//   const [mintedNFT, setMintedNFT] = useState(null);

//   // Market Data State
//   const [marketData, setMarketData] = useState(null);

//   const runBacktest = async () => {
//     if (!strategyText.trim()) {
//       setError('Please enter a trading strategy');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setBacktestResults(null);

//     try {
//       const response = await fetch(`${API_BASE}/backtest/run`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           description_text: strategyText,
//           ticker: ticker || 'SPY',
//           request_id: `strat_${Date.now()}`
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Backtest failed');
//       }

//       const data = await response.json();
//       setBacktestResults(data);
//     } catch (err) {
//       setError(err.message || 'Failed to run backtest');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const analyzeGuru = async () => {
//     if (guruSource === 'paste' && !guruTranscript.trim()) {
//       setError('Please enter a transcript');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setGuruResults(null);

//     try {
//       const response = await fetch(`${API_BASE}/guru/analyze`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           source_type: guruSource,
//           transcript_text: guruSource === 'paste' ? guruTranscript : null,
//           guru_identifier: 'demo_guru',
//           days: guruDays
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Analysis failed');
//       }

//       const data = await response.json();
//       setGuruResults(data);
//     } catch (err) {
//       setError(err.message || 'Failed to analyze guru');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mintNFT = async () => {
//     if (!backtestResults) {
//       setError('Please run a backtest first');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`${API_BASE}/mint/strategy`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           strategy_id: backtestResults.backtest_id,
//           owner_user_id: 'demo_user'
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Minting failed');
//       }

//       const data = await response.json();
//       setMintedNFT(data);
//     } catch (err) {
//       setError(err.message || 'Failed to mint NFT');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMarketData = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`${API_BASE}/market/ohlc`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ticker: ticker || 'SPY' })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to load data');
//       }

//       const data = await response.json();
//       setMarketData(data);
//     } catch (err) {
//       setError(err.message || 'Failed to load market data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getScoreBadge = (score) => {
//     if (score >= 80) return { text: 'Elite', color: 'bg-purple-500' };
//     if (score >= 60) return { text: 'Advanced', color: 'bg-blue-500' };
//     if (score >= 40) return { text: 'Intermediate', color: 'bg-green-500' };
//     return { text: 'Beginner', color: 'bg-gray-500' };
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
//       {/* Hero Header */}
//       <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
//                 <Sparkles className="w-6 h-6" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//                   neXaQuant
//                 </h1>
//                 <p className="text-sm text-purple-300">AI-Powered Trading Intelligence</p>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <span className="px-3 py-1 bg-purple-500/20 rounded-full text-xs border border-purple-500/30">
//                 Multi-Agent AI
//               </span>
//               <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs border border-blue-500/30">
//                 Solana NFTs
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="max-w-7xl mx-auto px-4 py-4">
//         <div className="flex gap-2 bg-black/30 rounded-xl p-1 backdrop-blur-sm border border-purple-500/20">
//           {[
//             { id: 'strategy', label: 'Strategy Builder', icon: TrendingUp },
//             { id: 'guru', label: 'Guru Analyzer', icon: Brain },
//             { id: 'market', label: 'Market Data', icon: Coins },
//             { id: 'nft', label: 'NFT Minting', icon: Bot }
//           ].map(({ id, label, icon: Icon }) => (
//             <button
//               key={id}
//               onClick={() => setActiveTab(id)}
//               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
//                 activeTab === id
//                   ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50'
//                   : 'hover:bg-white/5'
//               }`}
//             >
//               <Icon className="w-4 h-4" />
//               <span className="font-medium">{label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="max-w-7xl mx-auto px-4 mb-4">
//           <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="font-medium text-red-300">Error</p>
//               <p className="text-sm text-red-200 mt-1">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         {activeTab === 'strategy' && (
//           <div className="space-y-6">
//             <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <TrendingUp className="w-6 h-6 text-purple-400" />
//                 Natural Language Strategy Builder
//               </h2>
//               <p className="text-purple-200 mb-6">
//                 Describe your trading strategy in plain English. Our AI will parse it, backtest it, and show you the results.
//               </p>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-purple-300">
//                     Strategy Description
//                   </label>
//                   <textarea
//                     value={strategyText}
//                     onChange={(e) => setStrategyText(e.target.value)}
//                     placeholder="e.g., Buy SPY when 50-day SMA crosses above 200-day SMA. Sell when it crosses below."
//                     className="w-full h-32 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-purple-300">
//                     Ticker Symbol
//                   </label>
//                   <input
//                     type="text"
//                     value={ticker}
//                     onChange={(e) => setTicker(e.target.value.toUpperCase())}
//                     placeholder="SPY"
//                     className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>

//                 <button
//                   onClick={runBacktest}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Running Backtest...
//                     </>
//                   ) : (
//                     <>
//                       Run Backtest
//                       <ChevronRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {backtestResults && (
//               <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//                 <h3 className="text-xl font-bold mb-4 text-purple-300">Backtest Results</h3>
                
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                   {[
//                     { label: 'CAGR', value: `${(backtestResults.metrics.cagr * 100).toFixed(2)}%`, color: 'text-green-400' },
//                     { label: 'Sharpe Ratio', value: backtestResults.metrics.sharpe.toFixed(2), color: 'text-blue-400' },
//                     { label: 'Max Drawdown', value: `${(backtestResults.metrics.max_drawdown * 100).toFixed(2)}%`, color: 'text-red-400' },
//                     { label: 'Volatility', value: `${(backtestResults.metrics.volatility * 100).toFixed(2)}%`, color: 'text-yellow-400' }
//                   ].map(({ label, value, color }) => (
//                     <div key={label} className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                       <p className="text-sm text-purple-300 mb-1">{label}</p>
//                       <p className={`text-2xl font-bold ${color}`}>{value}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="flex gap-3">
//                   <button
//                     onClick={mintNFT}
//                     disabled={loading}
//                     className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 rounded-lg px-4 py-2 font-medium transition-all"
//                   >
//                     Mint as NFT on Solana
//                   </button>
//                 </div>
//               </div>
//             )}

//             {mintedNFT && (
//               <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
//                 <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
//                   <Sparkles className="w-5 h-5 text-yellow-400" />
//                   NFT Minted Successfully!
//                 </h3>
//                 <p className="text-purple-200 mb-4">Your strategy has been minted as an NFT on Solana Devnet</p>
//                 <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
//                   <p className="text-purple-300">Mint Address:</p>
//                   <p className="text-white break-all">{mintedNFT.mint_address}</p>
//                   <p className="text-purple-300 mt-2">Network:</p>
//                   <p className="text-white">{mintedNFT.network}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'guru' && (
//           <div className="space-y-6">
//             <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <Brain className="w-6 h-6 text-purple-400" />
//                 Guru Performance Analyzer
//               </h2>
//               <p className="text-purple-200 mb-6">
//                 Analyze trading gurus' performance by extracting calls from transcripts or generating sample data.
//               </p>

//               <div className="space-y-4">
//                 <div className="flex gap-4">
//                   <button
//                     onClick={() => setGuruSource('generate')}
//                     className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
//                       guruSource === 'generate'
//                         ? 'bg-purple-600 shadow-lg'
//                         : 'bg-black/50 border border-purple-500/30 hover:bg-white/5'
//                     }`}
//                   >
//                     Generate Sample Calls
//                   </button>
//                   <button
//                     onClick={() => setGuruSource('paste')}
//                     className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
//                       guruSource === 'paste'
//                         ? 'bg-purple-600 shadow-lg'
//                         : 'bg-black/50 border border-purple-500/30 hover:bg-white/5'
//                     }`}
//                   >
//                     Paste Transcript
//                   </button>
//                 </div>

//                 {guruSource === 'paste' && (
//                   <div>
//                     <label className="block text-sm font-medium mb-2 text-purple-300">
//                       Transcript Text
//                     </label>
//                     <textarea
//                       value={guruTranscript}
//                       onChange={(e) => setGuruTranscript(e.target.value)}
//                       placeholder="Paste trading guru's transcript here..."
//                       className="w-full h-32 bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                 )}

//                 {guruSource === 'generate' && (
//                   <div>
//                     <label className="block text-sm font-medium mb-2 text-purple-300">
//                       Days to Simulate
//                     </label>
//                     <input
//                       type="number"
//                       value={guruDays}
//                       onChange={(e) => setGuruDays(parseInt(e.target.value) || 90)}
//                       className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                 )}

//                 <button
//                   onClick={analyzeGuru}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Analyzing...
//                     </>
//                   ) : (
//                     <>
//                       Analyze Guru Performance
//                       <ChevronRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {guruResults && (
//               <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//                 <h3 className="text-xl font-bold mb-4 text-purple-300">Guru Analysis Results</h3>
                
//                 <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 mb-6 border border-purple-500/30">
//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <p className="text-sm text-purple-300 mb-1">Overall Score</p>
//                       <p className="text-5xl font-bold text-white">{guruResults.score}</p>
//                     </div>
//                     <div className={`px-4 py-2 rounded-full ${getScoreBadge(guruResults.score).color} font-bold`}>
//                       {getScoreBadge(guruResults.score).text}
//                     </div>
//                   </div>
//                   <div className="h-2 bg-black/50 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
//                       style={{ width: `${guruResults.score}%` }}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <h4 className="font-semibold text-purple-300">Sample Trades Analyzed</h4>
//                   <div className="grid gap-3">
//                     {guruResults.samples.slice(0, 5).map((sample, idx) => (
//                       <div key={idx} className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-purple-300">Trade #{idx + 1}</span>
//                           <div className="flex gap-4 text-sm">
//                             <span className="text-green-400">
//                               Sharpe: {sample.sharpe?.toFixed(2) || 'N/A'}
//                             </span>
//                             <span className="text-blue-400">
//                               CAGR: {((sample.cagr || 0) * 100).toFixed(1)}%
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'market' && (
//           <div className="space-y-6">
//             <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <Coins className="w-6 h-6 text-purple-400" />
//                 Market Data Explorer
//               </h2>
//               <p className="text-purple-200 mb-6">
//                 Load and visualize historical OHLC data for any ticker.
//               </p>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2 text-purple-300">
//                     Ticker Symbol
//                   </label>
//                   <input
//                     type="text"
//                     value={ticker}
//                     onChange={(e) => setTicker(e.target.value.toUpperCase())}
//                     placeholder="SPY"
//                     className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>

//                 <button
//                   onClick={loadMarketData}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Loading...
//                     </>
//                   ) : (
//                     <>
//                       Load Market Data
//                       <ChevronRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {marketData && (
//               <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//                 <h3 className="text-xl font-bold mb-4 text-purple-300">
//                   {marketData.ticker} - Price History
//                 </h3>
                
//                 <div className="bg-black/50 rounded-lg p-4 mb-4">
//                   <ResponsiveContainer width="100%" height={300}>
//                     <AreaChart data={marketData.ohlc.slice(-90)}>
//                       <defs>
//                         <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
//                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                       <XAxis dataKey="date" stroke="#9ca3af" />
//                       <YAxis stroke="#9ca3af" />
//                       <Tooltip 
//                         contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
//                         labelStyle={{ color: '#9ca3af' }}
//                       />
//                       <Area type="monotone" dataKey="close" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClose)" />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {marketData.ohlc.length > 0 && (
//                     <>
//                       <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                         <p className="text-sm text-purple-300 mb-1">Latest Close</p>
//                         <p className="text-xl font-bold text-white">
//                           ${marketData.ohlc[marketData.ohlc.length - 1].close.toFixed(2)}
//                         </p>
//                       </div>
//                       <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                         <p className="text-sm text-purple-300 mb-1">Data Points</p>
//                         <p className="text-xl font-bold text-white">{marketData.ohlc.length}</p>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'nft' && (
//           <div className="space-y-6">
//             <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <Bot className="w-6 h-6 text-purple-400" />
//                 NFT Strategy Marketplace
//               </h2>
//               <p className="text-purple-200 mb-6">
//                 Mint your backtested strategies as NFTs on Solana. Each NFT contains strategy code, performance metrics, and is tradeable on-chain.
//               </p>

//               <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/30">
//                 <h3 className="font-semibold mb-3 text-purple-300">How It Works</h3>
//                 <ol className="space-y-2 text-sm text-purple-200">
//                   <li className="flex items-start gap-2">
//                     <span className="font-bold text-purple-400">1.</span>
//                     <span>Create and backtest your trading strategy in the Strategy Builder</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="font-bold text-purple-400">2.</span>
//                     <span>Review performance metrics (Sharpe, CAGR, drawdown)</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="font-bold text-purple-400">3.</span>
//                     <span>Click "Mint as NFT" to create a Solana NFT with your strategy</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="font-bold text-purple-400">4.</span>
//                     <span>NFT metadata includes code, metrics, and strategy parameters</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <span className="font-bold text-purple-400">5.</span>
//                     <span>Trade strategies on-chain or use in Agent Marketplace simulations</span>
//                   </li>
//                 </ol>
//               </div>

//               {mintedNFT && (
//                 <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/30">
//                   <h3 className="font-semibold mb-3 text-blue-300">Your Latest Minted NFT</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-blue-200">Mint Address:</span>
//                       <span className="text-white font-mono">{mintedNFT.mint_address}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-blue-200">Network:</span>
//                       <span className="text-white">{mintedNFT.network}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-blue-200">Status:</span>
//                       <span className="text-green-400 font-medium">{mintedNFT.status}</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20 backdrop-blur-sm">
//               <h3 className="text-xl font-bold mb-4 text-purple-300">Tech Stack Highlights</h3>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                   <h4 className="font-semibold mb-2 text-purple-300">Multi-Agent AI System</h4>
//                   <p className="text-sm text-purple-200">
//                     OpenRouter powers multiple specialized AI agents for parsing strategies, analyzing gurus, and generating insights.
//                   </p>
//                 </div>
//                 <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                   <h4 className="font-semibold mb-2 text-purple-300">Solana Integration</h4>
//                   <p className="text-sm text-purple-200">
//                     Mint strategy NFTs on Solana devnet with full metadata including code and performance metrics.
//                   </p>
//                 </div>
//                 <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                   <h4 className="font-semibold mb-2 text-purple-300">Backtest Engine</h4>
//                   <p className="text-sm text-purple-200">
//                     Custom pandas-based backtesting with real Yahoo Finance data for accurate historical simulations.
//                   </p>
//                 </div>
//                 <div className="bg-black/50 rounded-lg p-4 border border-purple-500/20">
//                   <h4 className="font-semibold mb-2 text-purple-300">Agent Marketplace</h4>
//                   <p className="text-sm text-purple-200">
//                     Autonomous buyer and seller agents negotiate strategy purchases using LLM-powered decision making.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-purple-500/20">
//         <div className="text-center text-purple-300 text-sm">
//           <p className="mb-2">Built for HackNYU 2025 - FinTech Track</p>
//           <div className="flex items-center justify-center gap-4 flex-wrap">
//             <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Aristotle AI Agent Challenge</span>
//             <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">OpenRouter Challenge</span>
//             <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Solana Best Use</span>
//             <span className="px-2 py-1 bg-purple-500/10 rounded text-xs">Visa Agent Marketplace</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }