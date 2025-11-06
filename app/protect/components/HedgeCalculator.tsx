'use client';

import { useState } from 'react';
import { useStockPosition } from '../context/StockPositionContext';

export default function HedgeCalculator() {
  const { position, initialInvestment, currentValue, unrealizedLoss } = useStockPosition();
  const { shares, purchasePrice, currentPrice } = position;

  // Format number with commas for readability
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
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
  
  // Custom scenario
  const [customPrice, setCustomPrice] = useState(currentPrice);

  // Calculations
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
      description: putEnabled ? `Protected at $${formatNumber(putStrike)}` : 'No protection'
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
      description: callEnabled ? `Capped at $${formatNumber(callStrike)}` : 'No cap'
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
      <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                    -${formatNumber(putCost)}
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
                    +${formatNumber(callCredit)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Position Summary Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Current Position
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Initial Investment:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                ${formatNumber(initialInvestment)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Current Value:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                ${formatNumber(currentValue)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Unrealized P/L:</span>
              <span className={`font-semibold ${unrealizedLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${formatNumber(unrealizedLoss)} ({formatNumber((unrealizedLoss / initialInvestment) * 100)}%)
              </span>
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
              ${formatNumber(Math.abs(netOptionCost))}
            </div>
            <div className="text-blue-100 text-sm">
              {netOptionCost > 0 ? 'Cost' : netOptionCost < 0 ? 'Credit' : 'Neutral'}
            </div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">Total Cost Basis</div>
            <div className="text-3xl font-bold">
              ${formatNumber(totalCost)}
            </div>
            <div className="text-blue-100 text-sm">
              Stock + Options
            </div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">New Break-Even Price</div>
            <div className="text-3xl font-bold">
              ${formatNumber(newBreakEven)}
            </div>
            <div className="text-blue-100 text-sm">
              {newBreakEven > purchasePrice ? 
                `+$${formatNumber(newBreakEven - purchasePrice)} from entry` : 
                `$${formatNumber(purchasePrice - newBreakEven)} below entry`}
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
                      ${formatNumber(scenario.stockPrice)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                      ${formatNumber(result.stockValue)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      result.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.profitLoss >= 0 ? '+' : ''}${formatNumber(result.profitLoss)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      result.profitLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.profitLossPercentage >= 0 ? '+' : ''}{formatNumber(result.profitLossPercentage)}%
                    </td>
                  </tr>
                );
              })}
              
              {/* Custom Adjustable Scenario */}
              <tr className="border-b-2 border-slate-200 dark:border-slate-600 bg-blue-50/50 dark:bg-blue-900/10">
                <td className="py-4 px-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Custom Scenario
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(purchasePrice * 2, callEnabled ? callStrike * 1.5 : purchasePrice * 2)}
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  ${formatNumber(customPrice)}
                </td>
                <td className="text-right py-4 px-4 text-sm text-slate-900 dark:text-slate-100">
                  ${formatNumber(calculateScenario(customPrice).stockValue)}
                </td>
                <td className={`text-right py-4 px-4 text-sm font-semibold ${
                  calculateScenario(customPrice).profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculateScenario(customPrice).profitLoss >= 0 ? '+' : ''}${formatNumber(calculateScenario(customPrice).profitLoss)}
                </td>
                <td className={`text-right py-4 px-4 text-sm font-semibold ${
                  calculateScenario(customPrice).profitLossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {calculateScenario(customPrice).profitLossPercentage >= 0 ? '+' : ''}{formatNumber(calculateScenario(customPrice).profitLossPercentage)}%
                </td>
              </tr>
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
                • Your position is protected at ${formatNumber(putStrike)} with a put option
              </li>
            )}
            {callEnabled && (
              <li>
                • Your upside is capped at ${formatNumber(callStrike)} with a covered call
              </li>
            )}
            <li>
              • Maximum loss: ${formatNumber(calculateScenario(0).profitLoss)} (if stock goes to $0)
            </li>
            {callEnabled && (
              <li>
                • Maximum gain: ${formatNumber(calculateScenario(callStrike + 100).profitLoss)} (at call strike ${formatNumber(callStrike)})
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}



