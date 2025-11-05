'use client';

import Link from 'next/link';
import { useStockPosition } from './context/StockPositionContext';

export default function ProtectPage() {
  const { position, updatePosition, initialInvestment, currentValue, unrealizedLoss, unrealizedLossPercentage } = useStockPosition();
  
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const strategies = [
    {
      id: 'hedge',
      title: 'Hedge & Hold',
      icon: '📊',
      description: 'Add protective puts and covered calls while staying in position',
      tag: 'Flexible',
      tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      features: [
        'Optional protective put for downside protection',
        'Optional covered call for income generation',
        'Stay in position and adapt to market moves',
        'Analyze multiple scenarios at expiration'
      ],
      whenToUse: 'When you believe the position might recover',
    },
    {
      id: 'lock-in',
      title: 'Lock-In & Exit',
      icon: '🔒',
      description: 'Use synthetic short to lock in an exit price and minimize total loss',
      tag: 'Decisive',
      tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      features: [
        'Buy put + sell call at same strike (synthetic short)',
        'Lock in a guaranteed exit price',
        'Compare different exit points',
        'Minimize total realized loss'
      ],
      whenToUse: 'When you want to exit but minimize the damage',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
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
                <span className="text-2xl">🛡️</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Protect Your Position
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose your protection strategy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stock Position Input */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Your Stock Position
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Number of Shares
              </label>
              <input
                type="number"
                value={position.shares}
                onChange={(e) => updatePosition({ shares: Number(e.target.value) })}
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
                value={position.purchasePrice}
                onChange={(e) => updatePosition({ purchasePrice: Number(e.target.value) })}
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
                value={position.currentPrice}
                onChange={(e) => updatePosition({ currentPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid md:grid-cols-3 gap-4">
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
              <div className="text-xs text-slate-600 dark:text-slate-400">Unrealized P/L</div>
              <div className={`text-lg font-semibold ${unrealizedLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${formatNumber(unrealizedLoss)} ({formatNumber(unrealizedLossPercentage)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Choose Your Strategy
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {strategies.map((strategy) => (
              <Link
                key={strategy.id}
                href={`/protect/${strategy.id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{strategy.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {strategy.title}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${strategy.tagColor}`}>
                        {strategy.tag}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                  {strategy.description}
                </p>
                
                <ul className="space-y-2 mb-4">
                  {strategy.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    When to use:
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                    {strategy.whenToUse}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                  Open Calculator
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

