'use client';

import { useState } from 'react';

export default function OptionsCalculator() {
  // Stock position inputs
  const [shares, setShares] = useState(300);
  const [purchasePrice, setPurchasePrice] = useState(46.01);
  const [currentPrice, setCurrentPrice] = useState(42.8);
  
  // Protective Put inputs
  const [putEnabled, setPutEnabled] = useState(true);
  const [putStrike, setPutStrike] = useState(46);
  const [putPremium, setPutPremium] = useState(6.7);
  const [putDays, setPutDays] = useState(45);
  
  // Covered Call inputs
  const [callEnabled, setCallEnabled] = useState(false);
  const [callStrike, setCallStrike] = useState(50);
  const [callPremium, setCallPremium] = useState(2.0);
  const [callDays, setCallDays] = useState(45);

  // Calculations
  const initialInvestment = shares * purchasePrice;
  const currentValue = shares * currentPrice;
  const unrealizedLoss = currentValue - initialInvestment;
  
  const putCost = putEnabled ? putPremium * shares : 0;
  const callCredit = callEnabled ? callPremium * shares : 0;
  const netOptionCost = putCost - callCredit;
  
  const totalCost = initialInvestment + netOptionCost;
  const newBreakEven = totalCost / shares;
  
  // Scenario calculations
  const scenarios = [
    {
      name: 'Stock drops below put strike',
      stockPrice: putEnabled ? putStrike - 5 : currentPrice - 5,
      description: putEnabled ? `Protected at $${putStrike}` : 'No protection'
    },
    {
      name: 'Stock at current price',
      stockPrice: currentPrice,
      description: 'Current market price'
    },
    {
      name: 'Stock at break-even',
      stockPrice: newBreakEven,
      description: 'Break-even point'
    },
    {
      name: 'Stock at call strike',
      stockPrice: callEnabled ? callStrike : purchasePrice + 5,
      description: callEnabled ? `Capped at $${callStrike}` : 'No cap'
    },
  ];

  const calculateScenario = (stockPrice: number) => {
    let finalStockPrice = stockPrice;
    
    // Apply put protection
    if (putEnabled && stockPrice < putStrike) {
      finalStockPrice = putStrike;
    }
    
    // Apply call cap
    if (callEnabled && stockPrice > callStrike) {
      finalStockPrice = callStrike;
    }
    
    const stockValue = shares * finalStockPrice;
    const totalValue = stockValue;
    const profitLoss = totalValue - totalCost;
    
    return {
      stockValue,
      profitLoss,
      profitLossPercentage: (profitLoss / totalCost) * 100
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Options Strategy Calculator
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Analyze protective puts and covered calls on your stock positions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Stock Position Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Stock Position
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Number of Shares
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purchase Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Initial Investment:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${initialInvestment.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Current Value:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${currentValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Unrealized P/L:</span>
                <span className={`font-semibold ${unrealizedLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${unrealizedLoss.toFixed(2)} ({((unrealizedLoss / initialInvestment) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Options Strategies Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Options Strategies
          </h2>

          {/* Protective Put */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="putEnabled"
                checked={putEnabled}
                onChange={(e) => setPutEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="putEnabled" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Protective Put
              </label>
            </div>
            
            <div className={`space-y-3 ${!putEnabled ? 'opacity-50' : ''}`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Strike Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={putStrike}
                    onChange={(e) => setPutStrike(Number(e.target.value))}
                    disabled={!putEnabled}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Premium ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={putPremium}
                    onChange={(e) => setPutPremium(Number(e.target.value))}
                    disabled={!putEnabled}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Days to Expiration
                </label>
                <input
                  type="number"
                  value={putDays}
                  onChange={(e) => setPutDays(Number(e.target.value))}
                  disabled={!putEnabled}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                />
              </div>
              {putEnabled && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Total Cost:</div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    -${putCost.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Covered Call */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="callEnabled"
                checked={callEnabled}
                onChange={(e) => setCallEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="callEnabled" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Covered Call
              </label>
            </div>
            
            <div className={`space-y-3 ${!callEnabled ? 'opacity-50' : ''}`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Strike Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={callStrike}
                    onChange={(e) => setCallStrike(Number(e.target.value))}
                    disabled={!callEnabled}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Premium ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={callPremium}
                    onChange={(e) => setCallPremium(Number(e.target.value))}
                    disabled={!callEnabled}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Days to Expiration
                </label>
                <input
                  type="number"
                  value={callDays}
                  onChange={(e) => setCallDays(Number(e.target.value))}
                  disabled={!callEnabled}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700"
                />
              </div>
              {callEnabled && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Total Credit:</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    +${callCredit.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Position Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-blue-100 text-sm mb-1">Net Options Cost</div>
            <div className="text-3xl font-bold">
              ${Math.abs(netOptionCost).toFixed(2)}
            </div>
            <div className="text-blue-100 text-sm">
              {netOptionCost > 0 ? 'Cost' : netOptionCost < 0 ? 'Credit' : 'Neutral'}
            </div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">Total Cost Basis</div>
            <div className="text-3xl font-bold">
              ${totalCost.toFixed(2)}
            </div>
            <div className="text-blue-100 text-sm">
              Stock + Options
            </div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">New Break-Even Price</div>
            <div className="text-3xl font-bold">
              ${newBreakEven.toFixed(2)}
            </div>
            <div className="text-blue-100 text-sm">
              {newBreakEven > purchasePrice ? 
                `+$${(newBreakEven - purchasePrice).toFixed(2)} from entry` : 
                `$${(purchasePrice - newBreakEven).toFixed(2)} below entry`}
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Outcome Scenarios at Expiration
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Scenario
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Stock Price
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Position Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Profit/Loss
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Return
                </th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => {
                const result = calculateScenario(scenario.stockPrice);
                return (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {scenario.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {scenario.description}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ${scenario.stockPrice.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                      ${result.stockValue.toFixed(2)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      result.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.profitLoss >= 0 ? '+' : ''}${result.profitLoss.toFixed(2)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      result.profitLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.profitLossPercentage >= 0 ? '+' : ''}{result.profitLossPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Key Insights:
          </h3>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {putEnabled && (
              <li>
                • Your position is protected at ${putStrike.toFixed(2)} with a put option
              </li>
            )}
            {callEnabled && (
              <li>
                • Your upside is capped at ${callStrike.toFixed(2)} with a covered call
              </li>
            )}
            <li>
              • Maximum loss: ${calculateScenario(0).profitLoss.toFixed(2)} (if stock goes to $0)
            </li>
            {callEnabled && (
              <li>
                • Maximum gain: ${calculateScenario(callStrike + 100).profitLoss.toFixed(2)} (at call strike ${callStrike.toFixed(2)})
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

