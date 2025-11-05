'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WheelPage() {
  // Format number with commas for readability
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Stock parameters
  const [stockSymbol, setStockSymbol] = useState('');
  const [currentStockPrice, setCurrentStockPrice] = useState(50.00);
  const [contractsToSell, setContractsToSell] = useState(3); // Each contract = 100 shares
  
  // Short Put (Cash-Secured Put to sell)
  const [shortPutStrike, setShortPutStrike] = useState(48.00);
  const [shortPutPremium, setShortPutPremium] = useState(1.20);
  const [shortPutDays, setShortPutDays] = useState(7);
  
  // Long Put (Protective Put to buy)
  const [longPutStrike, setLongPutStrike] = useState(48.00);
  const [longPutPremium, setLongPutPremium] = useState(2.50);
  const [longPutDays, setLongPutDays] = useState(45);
  
  // Covered Call parameters (for future planning)
  const [estimatedCallPremium, setEstimatedCallPremium] = useState(1.50);
  const [estimatedCallStrike, setEstimatedCallStrike] = useState(52.00);

  // Calculations
  const sharesIfAssigned = contractsToSell * 100;
  
  // Premium collected from selling short put
  const shortPutCredit = shortPutPremium * sharesIfAssigned;
  
  // Cost of buying long put
  const longPutCost = longPutPremium * sharesIfAssigned;
  
  // Net cost/credit from the put spread
  const netPutCost = longPutCost - shortPutCredit;
  
  // If assigned at short put strike
  const costBasisIfAssigned = shortPutStrike * sharesIfAssigned;
  
  // Total capital required (cash secured + net put cost)
  const totalCapitalRequired = costBasisIfAssigned + netPutCost;
  
  // Per share cost basis including options
  const effectiveCostPerShare = totalCapitalRequired / sharesIfAssigned;
  
  // Shortfall to make up via covered calls (this is the net debit paid)
  const shortfallToMakeUp = netPutCost;
  
  // Days remaining after short put expires
  const daysRemainingAfterShortPut = longPutDays - shortPutDays;
  
  // Income from ONE covered call cycle if shares get called away
  const callPremiumIncome = estimatedCallPremium * sharesIfAssigned;
  
  // Capital gain if shares are called away at the call strike
  const capitalGainIfCalledAway = (estimatedCallStrike - effectiveCostPerShare) * sharesIfAssigned;
  
  // TOTAL profit from one call cycle if called away (premium + capital gain)
  const totalProfitIfCalledAway = callPremiumIncome + capitalGainIfCalledAway;
  
  // How many covered call cycles needed if shares DON'T get called away (premium only)
  // Use callPremiumIncome which accounts for ALL contracts, not just one
  const callsNeededForPremiumOnly = Math.ceil(shortfallToMakeUp / callPremiumIncome);
  
  // Can we break even in ONE cycle if called away?
  const breaksEvenInOneCycle = totalProfitIfCalledAway >= shortfallToMakeUp;

  // Scenarios
  const scenarios = [
    {
      name: 'Short Put Expires Worthless',
      description: 'Stock stays above short put strike',
      outcome: 'Keep short put premium, long put protects position',
      profitLoss: shortPutCredit - longPutCost,
      notes: 'Best case if not looking to get assigned'
    },
    {
      name: 'Assigned Shares at Short Put Strike',
      description: `Stock at or below $${formatNumber(shortPutStrike)}`,
      outcome: 'Buy shares, protected by long put',
      profitLoss: 0, // P/L is determined after selling covered calls
      notes: 'Begin selling covered calls to recover net debit'
    },
    {
      name: 'Stock Drops Significantly',
      description: `Stock drops below $${formatNumber(longPutStrike)}`,
      outcome: 'Long put provides protection',
      profitLoss: shortPutCredit - longPutCost, // Simplified
      notes: 'Protected by long put at strike price'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎡</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Wheel Strategy Calculator
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Initiate wheel strategy with protected put spread
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                About the Wheel Strategy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                This calculator helps you set up a protected wheel entry by:
              </p>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li><strong>Selling a short-dated cash-secured put</strong> (7 days) to collect premium and potentially get assigned shares</li>
                <li><strong>Buying a longer-dated protective put</strong> (45 days) at a similar strike for downside protection</li>
                <li><strong>Planning covered calls</strong> to recover the net debit and generate income before the long put expires</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Stock & Position Size */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Stock & Position Size
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stock Symbol (Optional)
                </label>
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Stock Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentStockPrice}
                  onChange={(e) => setCurrentStockPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Number of Contracts to Sell
                </label>
                <input
                  type="number"
                  value={contractsToSell}
                  onChange={(e) => setContractsToSell(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  = {sharesIfAssigned} shares if assigned
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Shares if Assigned:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {sharesIfAssigned}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Capital Required:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ${formatNumber(costBasisIfAssigned)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Short Put (Sell) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">📉</span>
              Short Put (Sell for Credit)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Strike Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={shortPutStrike}
                  onChange={(e) => setShortPutStrike(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {((shortPutStrike / currentStockPrice - 1) * 100).toFixed(1)}% from current price
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Premium per Share ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={shortPutPremium}
                  onChange={(e) => setShortPutPremium(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Days to Expiration
                </label>
                <input
                  type="number"
                  value={shortPutDays}
                  onChange={(e) => setShortPutDays(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Premium Credit:</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +${formatNumber(shortPutCredit)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ${formatNumber(shortPutPremium)} × {sharesIfAssigned} shares
                </div>
              </div>
            </div>
          </div>

          {/* Long Put (Buy) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              Long Put (Buy for Protection)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Strike Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={longPutStrike}
                  onChange={(e) => setLongPutStrike(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Usually same or near short put strike
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Premium per Share ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={longPutPremium}
                  onChange={(e) => setLongPutPremium(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Days to Expiration
                </label>
                <input
                  type="number"
                  value={longPutDays}
                  onChange={(e) => setLongPutDays(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Premium Cost:</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -${formatNumber(longPutCost)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ${formatNumber(longPutPremium)} × {sharesIfAssigned} shares
                </div>
              </div>
            </div>
          </div>

          {/* Covered Call Planning */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span>
              Covered Call Planning
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Call Strike ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedCallStrike}
                  onChange={(e) => setEstimatedCallStrike(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Premium per Share ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedCallPremium}
                  onChange={(e) => setEstimatedCallPremium(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Income per Cycle:</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  +${formatNumber(callPremiumIncome)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Per covered call round
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1">
                  <span>Days after short put expires:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {daysRemainingAfterShortPut} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-linear-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-6">Strategy Summary</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-emerald-100 text-sm mb-1">Net Put Cost (Debit)</div>
              <div className="text-3xl font-bold">
                ${formatNumber(netPutCost)}
              </div>
              <div className="text-emerald-100 text-sm mt-1">
                Shortfall to recover
              </div>
            </div>
            <div>
              <div className="text-emerald-100 text-sm mb-1">Effective Cost/Share</div>
              <div className="text-3xl font-bold">
                ${formatNumber(effectiveCostPerShare)}
              </div>
              <div className="text-emerald-100 text-sm mt-1">
                If assigned at ${formatNumber(shortPutStrike)}
              </div>
            </div>
            <div>
              <div className="text-emerald-100 text-sm mb-1">Premium-Only Cycles</div>
              <div className="text-3xl font-bold">
                {callsNeededForPremiumOnly}
              </div>
              <div className="text-emerald-100 text-sm mt-1">
                If not called away
              </div>
            </div>
            <div>
              <div className="text-emerald-100 text-sm mb-1">Total Capital at Risk</div>
              <div className="text-3xl font-bold">
                ${formatNumber(totalCapitalRequired)}
              </div>
              <div className="text-emerald-100 text-sm mt-1">
                Includes all premiums
              </div>
            </div>
          </div>
        </div>

        {/* Covered Call Income Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">💵</span>
              If Shares Get Called Away
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              When stock goes above ${formatNumber(estimatedCallStrike)} and shares are called away
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Call Premium Collected:</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +${formatNumber(callPremiumIncome)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Capital Gain:</span>
                <span className={`text-lg font-semibold ${capitalGainIfCalledAway >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {capitalGainIfCalledAway >= 0 ? '+' : ''}${formatNumber(capitalGainIfCalledAway)}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 -mt-2 mb-2">
                (${formatNumber(estimatedCallStrike)} call strike - ${formatNumber(effectiveCostPerShare)} cost) × {sharesIfAssigned} shares
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 dark:border-slate-600">
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Total Profit:</span>
                <span className={`text-2xl font-bold ${totalProfitIfCalledAway >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {totalProfitIfCalledAway >= 0 ? '+' : ''}${formatNumber(totalProfitIfCalledAway)}
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Recovery Status:</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {((totalProfitIfCalledAway / shortfallToMakeUp) * 100).toFixed(0)}% of shortfall
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`${breaksEvenInOneCycle ? 'bg-green-500' : 'bg-amber-500'} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${Math.min((totalProfitIfCalledAway / shortfallToMakeUp) * 100, 100)}%` }}
                  />
                </div>
                {breaksEvenInOneCycle && (
                  <div className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                    ✓ Breaks even in ONE cycle if called away!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              If Shares Don't Get Called Away
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              When stock stays below ${formatNumber(estimatedCallStrike)} (collect premium only)
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Premium per Cycle:</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +${formatNumber(callPremiumIncome)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Cycles Needed:</span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {callsNeededForPremiumOnly} cycle{callsNeededForPremiumOnly !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400">Time Available:</span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {daysRemainingAfterShortPut} days
                </span>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">Strategy:</h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Keep shares and collect premium</li>
                  <li>• Repeat {callsNeededForPremiumOnly} times to break even</li>
                  <li>• After break even, all premium is profit</li>
                  <li>• Protected by long put until day {longPutDays}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Potential Scenarios
          </h2>
          
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {scenario.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {scenario.description}
                    </p>
                  </div>
                  {scenario.profitLoss !== 0 && (
                    <div className={`text-right ${scenario.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <div className="text-lg font-bold">
                        {scenario.profitLoss >= 0 ? '+' : ''}${formatNumber(Math.abs(scenario.profitLoss))}
                      </div>
                      <div className="text-xs">Net P/L</div>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 mt-2">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Outcome:</strong> {scenario.outcome}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {scenario.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Action Plan
          </h2>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sell Cash-Secured Put</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sell {contractsToSell} contract{contractsToSell !== 1 ? 's' : ''} of ${formatNumber(shortPutStrike)} put expiring in {shortPutDays} days
                  <br />
                  <strong>Collect:</strong> ${formatNumber(shortPutCredit)} premium
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Buy Protective Put</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Buy {contractsToSell} contract{contractsToSell !== 1 ? 's' : ''} of ${formatNumber(longPutStrike)} put expiring in {longPutDays} days
                  <br />
                  <strong>Cost:</strong> ${formatNumber(longPutCost)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">If Assigned: Sell Covered Calls</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Once assigned {sharesIfAssigned} shares, sell {contractsToSell} covered call contract{contractsToSell !== 1 ? 's' : ''}
                  <br />
                  <strong>Goal:</strong> Recover ${formatNumber(shortfallToMakeUp)} net debit
                  <br />
                  <strong>If called away at ${formatNumber(estimatedCallStrike)}:</strong> ${formatNumber(callPremiumIncome)} premium + ${formatNumber(capitalGainIfCalledAway)} capital gain = ${formatNumber(totalProfitIfCalledAway)} total
                  <br />
                  <strong>If not called away:</strong> ${formatNumber(callPremiumIncome)} per cycle × {callsNeededForPremiumOnly} cycles = ${formatNumber(callPremiumIncome * callsNeededForPremiumOnly)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Continue the Wheel</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  After breaking even, continue selling covered calls for pure income generation
                  <br />
                  If called away, restart the cycle by selling cash-secured puts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
                Important Risks to Consider
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• You must have sufficient capital to be assigned {sharesIfAssigned} shares at ${formatNumber(shortPutStrike)} per share</li>
                <li>• The long put costs more than the short put premium, creating a net debit to recover</li>
                <li>• Covered call premiums may vary - you might need more cycles than estimated</li>
                <li>• If the stock rallies hard, your shares may get called away via covered calls</li>
                <li>• The long put provides protection but expires in {longPutDays} days</li>
                <li>• This calculator is for educational purposes only - always assess your own risk tolerance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

