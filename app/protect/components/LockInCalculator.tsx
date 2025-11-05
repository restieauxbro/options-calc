'use client';

import { useState } from 'react';
import { useStockPosition } from '../context/StockPositionContext';

export default function LockInCalculator() {
  const { position, initialInvestment, currentValue, unrealizedLoss } = useStockPosition();
  const { shares, purchasePrice, currentPrice } = position;

  // Format number with commas for readability
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Lock-in strike prices to compare
  const [strikes] = useState([
    Math.floor(currentPrice - 2),
    Math.floor(currentPrice),
    Math.ceil(purchasePrice - 1),
    Math.ceil(purchasePrice),
    Math.ceil(purchasePrice + 1),
  ]);

  // Selected strike for detailed view
  const [selectedStrike, setSelectedStrike] = useState(strikes[2]);
  
  // Days to expiration
  const [days, setDays] = useState(45);

  // Calculate option prices (simplified estimates for demonstration)
  const estimateOptionPrices = (strike: number) => {
    // These are rough estimates - in reality you'd fetch real option prices
    const intrinsicPut = Math.max(0, strike - currentPrice);
    const intrinsicCall = Math.max(0, currentPrice - strike);
    const timeValue = (days / 365) * 2; // Simplified time value
    
    const putPremium = intrinsicPut + timeValue;
    const callPremium = intrinsicCall + timeValue;
    
    return { putPremium, callPremium };
  };

  const calculateLockIn = (strike: number) => {
    const { putPremium, callPremium } = estimateOptionPrices(strike);
    
    const putCost = putPremium * shares;
    const callCredit = callPremium * shares;
    const netCost = putCost - callCredit;
    
    // You're locked in at the strike price
    const exitValue = strike * shares;
    const totalCost = initialInvestment + netCost;
    const netLoss = exitValue - totalCost;
    const lossPercentage = (netLoss / initialInvestment) * 100;
    
    return {
      strike,
      putPremium,
      callPremium,
      putCost,
      callCredit,
      netCost,
      exitValue,
      totalCost,
      netLoss,
      lossPercentage,
    };
  };

  const selectedCalc = calculateLockIn(selectedStrike);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current Position */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Current Position
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Initial Investment</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              ${formatNumber(initialInvestment)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Current Value</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              ${formatNumber(currentValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Unrealized Loss</div>
            <div className={`text-lg font-semibold ${unrealizedLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${formatNumber(unrealizedLoss)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Entry Price</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              ${formatNumber(purchasePrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Days to Expiration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Days to Expiration
        </label>
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full md:w-48 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Strike Comparison */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Compare Exit Points
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Select a strike price to lock in your exit. Lower strikes cost less but result in larger losses.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Strike
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Net Cost
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Exit Value
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Loss
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Loss %
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {strikes.map((strike) => {
                const calc = calculateLockIn(strike);
                const isSelected = strike === selectedStrike;
                return (
                  <tr 
                    key={strike}
                    className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        ${formatNumber(strike)}
                      </div>
                      {strike >= purchasePrice && (
                        <div className="text-xs text-green-600 dark:text-green-400">Above entry</div>
                      )}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      calc.netCost >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {calc.netCost >= 0 ? '-' : '+'}${formatNumber(Math.abs(calc.netCost))}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                      ${formatNumber(calc.exitValue)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      calc.netLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calc.netLoss >= 0 ? '+' : ''}${formatNumber(calc.netLoss)}
                    </td>
                    <td className={`text-right py-3 px-4 text-sm font-semibold ${
                      calc.lossPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calc.lossPercentage >= 0 ? '+' : ''}{formatNumber(calc.lossPercentage)}%
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => setSelectedStrike(strike)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Strike Details */}
      <div className="bg-linear-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Selected Exit Strategy</h2>
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-amber-100 text-sm mb-1">Exit Strike</div>
            <div className="text-3xl font-bold">
              ${formatNumber(selectedCalc.strike)}
            </div>
          </div>
          <div>
            <div className="text-amber-100 text-sm mb-1">Net Option Cost</div>
            <div className="text-3xl font-bold">
              {selectedCalc.netCost >= 0 ? '-' : '+'}${formatNumber(Math.abs(selectedCalc.netCost))}
            </div>
          </div>
          <div>
            <div className="text-amber-100 text-sm mb-1">Final Exit Value</div>
            <div className="text-3xl font-bold">
              ${formatNumber(selectedCalc.exitValue)}
            </div>
          </div>
          <div>
            <div className="text-amber-100 text-sm mb-1">Total Realized Loss</div>
            <div className="text-3xl font-bold">
              ${formatNumber(selectedCalc.netLoss)}
            </div>
            <div className="text-amber-100 text-sm">
              {formatNumber(selectedCalc.lossPercentage)}%
            </div>
          </div>
        </div>

        <div className="bg-amber-600/30 rounded-lg p-4">
          <h3 className="font-semibold mb-2">How This Works:</h3>
          <ul className="space-y-1 text-sm text-amber-50">
            <li>• Buy ${formatNumber(selectedCalc.strike)} Put @ ${formatNumber(selectedCalc.putPremium)} = ${formatNumber(selectedCalc.putCost)} cost</li>
            <li>• Sell ${formatNumber(selectedCalc.strike)} Call @ ${formatNumber(selectedCalc.callPremium)} = ${formatNumber(selectedCalc.callCredit)} credit</li>
            <li>• Your position is locked in at ${formatNumber(selectedCalc.strike)} regardless of stock movement</li>
            <li>• Total loss minimized to ${formatNumber(selectedCalc.netLoss)} (vs ${formatNumber(unrealizedLoss)} currently)</li>
          </ul>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Key Insights:
        </h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">🔒</span>
            <span>This is a <strong>synthetic short</strong> position - you're effectively "out" at the strike price</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">💡</span>
            <span>Higher strikes = better exit price but cost more to establish</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">⚠️</span>
            <span>Once established, you have no upside or downside - you're locked in</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 dark:text-amber-400 mt-0.5">✓</span>
            <span>Best used when you want to exit but believe the current price is unfavorable</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

