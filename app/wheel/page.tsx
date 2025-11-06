'use client';

import Link from 'next/link';
import { useState } from 'react';

// Wheel Strategy Recommendation Object
// Update this object to change the initial strategy recommendation
const wheelStrategyRecommendation = {
  stockSymbol: 'SOXL',
  currentStockPrice: 46.83, // Real market price as of Nov 5, 2025 (from GLOBAL_QUOTE)
  contractsToSell: 1, // Each contract = 100 shares
  
  // Short Put (Cash-Secured Put to sell) - ITM put with strike at or above current price
  // Target: ~7-14 days out, strike ~$47
  shortPutStrike: 47.00,
  shortPutPremium: 3.20, // Estimated mark price for Nov 14 $47 ITM put (based on Nov 4 options data)
  shortPutDays: 9, // Nov 14, 2025 expiration (9 days from Nov 5, 2025)
  
  // Long Put (Protective Put to buy) - ITM put with same/similar strike
  // Target: 30+ days beyond short put expiration (default rule)
  longPutStrike: 47.00,
  longPutPremium: 4.50, // Estimated mark price for Dec 19 $47 ITM put (44 days out, 35 days beyond short put)
  longPutDays: 44, // Dec 19, 2025 expiration (44 days from Nov 5, 2025, 35 days beyond short put)
  
  // Covered Call parameters - OTM call with strike above current price
  // Target: Strike above $46.83, for use if assigned shares
  estimatedCallPremium: 2.10, // Estimated mark price for Nov 14 $48 OTM call (based on Nov 4 options data)
  estimatedCallStrike: 48.00, // OTM call strike above current price
};

export default function WheelPage() {
  // Format number with commas for readability
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Initialize state from recommendation object
  const [stockSymbol, setStockSymbol] = useState(wheelStrategyRecommendation.stockSymbol);
  const [currentStockPrice, setCurrentStockPrice] = useState(wheelStrategyRecommendation.currentStockPrice);
  const [contractsToSell, setContractsToSell] = useState(wheelStrategyRecommendation.contractsToSell);
  
  // Short Put (Cash-Secured Put to sell)
  const [shortPutStrike, setShortPutStrike] = useState(wheelStrategyRecommendation.shortPutStrike);
  const [shortPutPremium, setShortPutPremium] = useState(wheelStrategyRecommendation.shortPutPremium);
  const [shortPutDays, setShortPutDays] = useState(wheelStrategyRecommendation.shortPutDays);
  
  // Long Put (Protective Put to buy)
  const [longPutStrike, setLongPutStrike] = useState(wheelStrategyRecommendation.longPutStrike);
  const [longPutPremium, setLongPutPremium] = useState(wheelStrategyRecommendation.longPutPremium);
  const [longPutDays, setLongPutDays] = useState(wheelStrategyRecommendation.longPutDays);
  
  // Covered Call parameters
  const [estimatedCallPremium, setEstimatedCallPremium] = useState(wheelStrategyRecommendation.estimatedCallPremium);
  
  const [estimatedCallStrike, setEstimatedCallStrike] = useState(wheelStrategyRecommendation.estimatedCallStrike);
  
  // Recovery strategy analysis (for scenario where assigned and stock drops)
  const [currentStockPriceAfterAssignment, setCurrentStockPriceAfterAssignment] = useState(43.00);
  const [currentLongPutValue, setCurrentLongPutValue] = useState(4.50); // Current value of long put (now worth more)
  const [newPutPremium, setNewPutPremium] = useState(2.50); // Premium for selling new put
  const [newPutDaysToExpiry, setNewPutDaysToExpiry] = useState(10); // Days to expiry for new put (must be less than long put days remaining)

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

  // Scenario calculations
  // Scenario 1: Short Put Expires Worthless
  const scenario1NetPL = shortPutCredit - longPutCost;
  const scenario1ROI = (scenario1NetPL / (longPutCost)) * 100;
  
  // Scenario 2: Assigned Shares
  // If assigned, we have shares and still hold the long put
  // The long put value if stock drops to long put strike
  const longPutValueIfExercised = (longPutStrike - shortPutStrike) * sharesIfAssigned; // Intrinsic value if stock drops
  const scenario2MaxLoss = netPutCost - longPutValueIfExercised; // Worst case if stock drops to long put strike
  const scenario2BreakEvenStockPrice = effectiveCostPerShare; // Stock price needed to break even
  
  // Scenario 3: Stock Drops Significantly
  // Calculate protection at different stock prices (assuming we were assigned)
  const scenario3PLAtLongPutStrike = shortPutCredit - longPutCost; // Net debit paid
  const stockPriceDrops10 = currentStockPrice * 0.9;
  const stockPriceDrops20 = currentStockPrice * 0.8;
  const stockPriceDrops30 = currentStockPrice * 0.7;
  
  // If assigned and stock drops further below assignment price
  // Loss on shares = (assignment price - current stock price) * shares
  // But protected by long put value
  const lossOnSharesAt10Percent = (shortPutStrike - stockPriceDrops10) * sharesIfAssigned;
  const lossOnSharesAt20Percent = (shortPutStrike - stockPriceDrops20) * sharesIfAssigned;
  const lossOnSharesAt30Percent = (shortPutStrike - stockPriceDrops30) * sharesIfAssigned;
  
  // Protection value from long put at different prices (intrinsic value)
  const protectionAt10Percent = Math.max(0, (longPutStrike - stockPriceDrops10) * sharesIfAssigned);
  const protectionAt20Percent = Math.max(0, (longPutStrike - stockPriceDrops20) * sharesIfAssigned);
  const protectionAt30Percent = Math.max(0, (longPutStrike - stockPriceDrops30) * sharesIfAssigned);
  
  // Net loss after protection
  // If stock drops below longPutStrike, we can exercise to limit loss
  // Net loss = netPutCost (already paid) + loss on shares beyond protection
  // If stock is above longPutStrike, loss = netPutCost + (shortPutStrike - stockPrice) * shares
  // If stock is below longPutStrike, we can exercise long put, so loss = netPutCost + (shortPutStrike - longPutStrike) * shares
  const calculateNetLoss = (stockPrice: number) => {
    if (stockPrice >= longPutStrike) {
      // Stock above protection level - we lose on shares but can't exercise put yet
      const lossOnShares = (shortPutStrike - stockPrice) * sharesIfAssigned;
      return netPutCost + Math.max(0, lossOnShares);
    } else {
      // Stock below protection level - we can exercise long put to limit loss
      const lossOnShares = (shortPutStrike - longPutStrike) * sharesIfAssigned;
      return netPutCost + Math.max(0, lossOnShares);
    }
  };
  
  const netLossAt10Percent = calculateNetLoss(stockPriceDrops10);
  const netLossAt20Percent = calculateNetLoss(stockPriceDrops20);
  const netLossAt30Percent = calculateNetLoss(stockPriceDrops30);
  
  // Recovery Strategy Analysis: Decision logic
  // Scenario: Assigned at $47, stock now at $43 (or user input)
  // Note: Platform doesn't allow early exercise - options can only be assigned at expiry
  const daysRemainingOnLongPut = longPutDays - shortPutDays; // Days left after short put expires
  
  // After selling shares at market
  const recoverySharesProceeds = currentStockPriceAfterAssignment * sharesIfAssigned;
  const recoveryLongPutSaleValue = currentLongPutValue * sharesIfAssigned; // Current value of long put
  const recoveryTotalFromSharesAndPut = recoverySharesProceeds + recoveryLongPutSaleValue;
  
  // Total cost basis: assignment cost + net put cost
  const recoveryTotalCost = (shortPutStrike * sharesIfAssigned) + netPutCost;
  
  // Net result from selling shares + selling long put
  const recoveryNetFromExit = recoveryTotalFromSharesAndPut - recoveryTotalCost;
  
  // Decision: Does selling long put cover the net put cost (and make profit)?
  const sellingPutCoversCost = recoveryNetFromExit >= 0;
  
  // If selling put doesn't cover cost: Keep long put + sell new put to reconfigure wheel
  // New put must have closer expiry than long put
  const newPutExpiryValid = newPutDaysToExpiry < daysRemainingOnLongPut;
  const recoveryReconfigureSharesProceeds = currentStockPriceAfterAssignment * sharesIfAssigned;
  const recoveryReconfigureNewPutPremium = newPutPremium * sharesIfAssigned;
  const recoveryReconfigureTotalProceeds = recoveryReconfigureSharesProceeds + recoveryReconfigureNewPutPremium;
  // Keep long put (don't sell it), so we still have the net put cost
  // The long put is kept as protection for when the new put gets assigned
  // We don't count it as "profit" since we're keeping it for protection, not selling it
  const recoveryReconfigureNet = recoveryReconfigureTotalProceeds - recoveryTotalCost;
  
  // Recommendation: Compare Path A profit vs Path B immediate cash flow
  // Path A: Immediate profit from exit (everything sold)
  // Path B: Immediate cash flow (keep long put as protection asset for future assignment)
  // Note: Path B keeps long put for protection when new put gets assigned, so we compare immediate cash only
  const pathBIsBetter = recoveryReconfigureNet > recoveryNetFromExit;

  // Scenarios with detailed calculations and strategic moves
  const scenarios = [
    {
      name: 'Short Put Expires Worthless',
      description: `Stock stays above $${formatNumber(shortPutStrike)} (short put strike)`,
      outcome: 'Keep short put premium, long put still active for protection',
      profitLoss: scenario1NetPL,
      calculations: [
        { label: 'Short Put Premium Collected', value: `+${formatNumber(shortPutCredit)}`, color: 'green' },
        { label: 'Long Put Cost Paid', value: `-${formatNumber(longPutCost)}`, color: 'red' },
        { label: 'Net Profit/Loss', value: `${scenario1NetPL >= 0 ? '+' : ''}${formatNumber(scenario1NetPL)}`, color: scenario1NetPL >= 0 ? 'green' : 'red' },
        { label: 'ROI on Long Put Investment', value: `${scenario1ROI >= 0 ? '+' : ''}${formatNumber(scenario1ROI)}%`, color: scenario1ROI >= 0 ? 'green' : 'red' }
      ],
      strategicMoves: [
        'Close the long put if it has significant time value remaining',
        'Roll the short put to a new expiration to collect more premium',
        'Consider selling a new cash-secured put at a higher strike if stock continues rising',
        'If bullish, you can sell the long put and keep the profit'
      ],
      notes: 'Best case if not looking to get assigned - you keep the net credit'
    },
    {
      name: 'Assigned Shares at Short Put Strike',
      description: `Stock at or below $${formatNumber(shortPutStrike)} at expiration`,
      outcome: 'Buy shares at assignment price, protected by long put',
      profitLoss: 0, // P/L is determined after selling covered calls
      calculations: [
        { label: 'Assignment Price', value: `${formatNumber(shortPutStrike)} per share`, color: 'neutral' },
        { label: 'Net Put Cost (Debit)', value: `${formatNumber(netPutCost)}`, color: 'red' },
        { label: 'Effective Cost Per Share', value: `${formatNumber(effectiveCostPerShare)}`, color: 'neutral' },
        { label: 'Break-Even Stock Price', value: `${formatNumber(scenario2BreakEvenStockPrice)}`, color: 'amber' },
        { label: 'Long Put Protection Value', value: `Up to ${formatNumber(longPutValueIfExercised)} if stock drops to $${formatNumber(longPutStrike)}`, color: 'green' },
        { label: 'Covered Call Income Potential', value: `${formatNumber(callPremiumIncome)} per cycle`, color: 'green' }
      ],
      strategicMoves: [
        `Sell covered calls at $${formatNumber(estimatedCallStrike)} or higher to generate income`,
        `Target ${callsNeededForPremiumOnly} call cycles to recover the ${formatNumber(netPutCost)} net debit`,
        'Hold shares until you recover the net debit, then continue selling calls for pure profit',
        'If stock rallies quickly, let shares get called away and restart the wheel with a new put',
        'Long put provides downside protection until day ' + longPutDays
      ],
      notes: 'Begin selling covered calls to recover net debit and generate income'
    },
    {
      name: 'Stock Drops Significantly',
      description: `Stock drops below $${formatNumber(longPutStrike)} (long put strike)`,
      outcome: 'Long put provides downside protection',
      profitLoss: scenario3PLAtLongPutStrike,
      calculations: [
        { label: 'If Stock Drops 10% (to $' + formatNumber(stockPriceDrops10) + ')', value: `Net Loss: ${formatNumber(netLossAt10Percent)}, Protection: ${formatNumber(protectionAt10Percent)}`, color: netLossAt10Percent <= netPutCost ? 'green' : 'amber' },
        { label: 'If Stock Drops 20% (to $' + formatNumber(stockPriceDrops20) + ')', value: `Net Loss: ${formatNumber(netLossAt20Percent)}, Protection: ${formatNumber(protectionAt20Percent)}`, color: netLossAt20Percent <= netPutCost ? 'green' : 'amber' },
        { label: 'If Stock Drops 30% (to $' + formatNumber(stockPriceDrops30) + ')', value: `Net Loss: ${formatNumber(netLossAt30Percent)}, Protection: ${formatNumber(protectionAt30Percent)}`, color: netLossAt30Percent <= netPutCost ? 'green' : 'red' },
        { label: 'Maximum Protected Loss', value: `${formatNumber(Math.max(0, netPutCost))} (net debit paid)`, color: netPutCost >= 0 ? 'green' : 'red' },
        { label: 'Long Put Protection Level', value: `$${formatNumber(longPutStrike)} per share (assignment at expiry if stock below)`, color: 'green' }
      ],
      strategicMoves: [
        'If assigned: The long put will be assigned at expiry if stock is below $' + formatNumber(longPutStrike) + ' (your platform allows assignment only at expiry)',
        'If not assigned: Let the short put expire worthless, then wait for long put expiry - if stock is below $' + formatNumber(longPutStrike) + ' at expiry, you can be assigned',
        'Consider selling the long put option itself if it has significant value (intrinsic + time value)',
        'If stock recovers after assignment, sell covered calls at higher strikes to recover losses',
        'Monitor the long put - you can sell it to close before expiration to capture its value'
      ],
      notes: 'Long put limits maximum loss to the net debit paid, regardless of how far stock drops'
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
                <li><strong>Selling a short-dated cash-secured put</strong> to collect premium and potentially get assigned shares</li>
                <li><strong>Buying a longer-dated protective put</strong> at a similar strike for downside protection</li>
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
                  step="0.1"
                  value={currentStockPrice}
                  onChange={(e) => setCurrentStockPrice(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setCurrentStockPrice((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setCurrentStockPrice((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setContractsToSell((prev) => prev + 1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setContractsToSell((prev) => Math.max(1, prev - 1));
                    }
                  }}
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
                  step="0.1"
                  value={shortPutStrike}
                  onChange={(e) => setShortPutStrike(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setShortPutStrike((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setShortPutStrike((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
                  step="0.1"
                  value={shortPutPremium}
                  onChange={(e) => setShortPutPremium(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setShortPutPremium((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setShortPutPremium((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setShortPutDays((prev) => prev + 1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setShortPutDays((prev) => Math.max(1, prev - 1));
                    }
                  }}
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
                  step="0.1"
                  value={longPutStrike}
                  onChange={(e) => setLongPutStrike(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setLongPutStrike((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setLongPutStrike((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
                  step="0.1"
                  value={longPutPremium}
                  onChange={(e) => setLongPutPremium(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setLongPutPremium((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setLongPutPremium((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setLongPutDays((prev) => prev + 1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setLongPutDays((prev) => Math.max(1, prev - 1));
                    }
                  }}
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
                  step="0.5"
                  value={estimatedCallStrike}
                  onChange={(e) => setEstimatedCallStrike(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setEstimatedCallStrike((prev) => prev + 0.5);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setEstimatedCallStrike((prev) => Math.max(0, prev - 0.5));
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Premium per Share ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={estimatedCallPremium}
                  onChange={(e) => setEstimatedCallPremium(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setEstimatedCallPremium((prev) => prev + 0.1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setEstimatedCallPremium((prev) => Math.max(0, prev - 0.1));
                    }
                  }}
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
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 -mt-2 mb-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">How Capital Gain is Calculated:</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>1. <strong>Sale Price:</strong> ${formatNumber(estimatedCallStrike)} per share (call strike)</div>
                  <div>2. <strong>Your Cost Basis:</strong> ${formatNumber(effectiveCostPerShare)} per share</div>
                  <div className="ml-4 text-slate-500 dark:text-slate-500">
                    • Assignment price: ${formatNumber(shortPutStrike)} per share
                    <br />
                    • Plus net put cost: ${formatNumber(netPutCost / sharesIfAssigned)} per share
                    <br />
                    • (${formatNumber(longPutPremium)} - ${formatNumber(shortPutPremium)} = ${formatNumber((longPutPremium - shortPutPremium))} net debit per share)
                  </div>
                  <div>3. <strong>Capital Gain Formula:</strong></div>
                  <div className="ml-4 font-mono text-slate-700 dark:text-slate-300">
                    (${formatNumber(estimatedCallStrike)} - ${formatNumber(effectiveCostPerShare)}) × {sharesIfAssigned} shares = ${capitalGainIfCalledAway >= 0 ? '+' : ''}${formatNumber(capitalGainIfCalledAway)}
                  </div>
                </div>
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-1">
                      {scenario.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {scenario.description}
                    </p>
                  </div>
                  {scenario.profitLoss !== 0 && (
                    <div className={`text-right ml-4 ${scenario.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <div className="text-xl font-bold">
                        {scenario.profitLoss >= 0 ? '+' : ''}${formatNumber(Math.abs(scenario.profitLoss))}
                      </div>
                      <div className="text-xs">Net P/L</div>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <strong>Outcome:</strong> {scenario.outcome}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {scenario.notes}
                  </p>
                </div>

                {/* Calculations Section */}
                {scenario.calculations && scenario.calculations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
                      <span>📊</span>
                      Detailed Calculations
                    </h4>
                    <div className="space-y-1.5">
                      {scenario.calculations.map((calc, calcIndex) => (
                        <div key={calcIndex} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600 dark:text-slate-400">{calc.label}:</span>
                          <span className={`font-semibold ${
                            calc.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            calc.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            calc.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                            'text-slate-900 dark:text-slate-100'
                          }`}>
                            {calc.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategic Moves Section */}
                {scenario.strategicMoves && scenario.strategicMoves.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1">
                      <span>🎯</span>
                      Strategic Next Moves
                    </h4>
                    <ul className="space-y-1.5">
                      {scenario.strategicMoves.map((move, moveIndex) => (
                        <li key={moveIndex} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                          <span>{move}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Strategy Analysis */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            Recovery Strategy Analysis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Analyze recovery options if you get assigned and stock drops below your assignment price
          </p>
          
          {/* Recovery Target */}
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Amount to Recover
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Net Put Cost (Debit): The difference between long put cost and short put premium collected
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${formatNumber(netPutCost)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  ${formatNumber(longPutPremium)} - ${formatNumber(shortPutPremium)} × {sharesIfAssigned} shares
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Stock Price After Assignment ($)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentStockPriceAfterAssignment}
                onChange={(e) => setCurrentStockPriceAfterAssignment(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCurrentStockPriceAfterAssignment((prev) => prev + 0.1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCurrentStockPriceAfterAssignment((prev) => Math.max(0, prev - 0.1));
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Long Put Value ($)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentLongPutValue}
                onChange={(e) => setCurrentLongPutValue(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCurrentLongPutValue((prev) => prev + 0.1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCurrentLongPutValue((prev) => Math.max(0, prev - 0.1));
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Current value per share of long put option
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Put Premium ($)
              </label>
              <input
                type="number"
                step="0.1"
                value={newPutPremium}
                onChange={(e) => setNewPutPremium(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNewPutPremium((prev) => prev + 0.1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNewPutPremium((prev) => Math.max(0, prev - 0.1));
                  }
                }}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Premium for new ${formatNumber(shortPutStrike)} put
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Put Days to Expiry
              </label>
              <input
                type="number"
                value={newPutDaysToExpiry}
                onChange={(e) => setNewPutDaysToExpiry(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNewPutDaysToExpiry((prev) => prev + 1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNewPutDaysToExpiry((prev) => Math.max(1, prev - 1));
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  newPutExpiryValid ? 'border-slate-300 dark:border-slate-600' : 'border-red-300 dark:border-red-600'
                }`}
              />
              <p className={`text-xs mt-1 ${newPutExpiryValid ? 'text-slate-500 dark:text-slate-400' : 'text-red-600 dark:text-red-400'}`}>
                {newPutExpiryValid 
                  ? `Must be less than ${daysRemainingOnLongPut} days (long put remaining)`
                  : `⚠️ Must be less than ${daysRemainingOnLongPut} days`
                }
              </p>
            </div>
          </div>

          {/* Strategy Paths */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Path A: Exit Strategy */}
            <div className={`border-2 rounded-lg p-4 ${
              !pathBIsBetter 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <span>Path A: Exit Strategy</span>
                {!pathBIsBetter && <span className="text-green-600 dark:text-green-400">✓ Recommended</span>}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Sell shares + sell long put (complete exit)
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sell shares:</span>
                  <span className="font-semibold">${formatNumber(recoverySharesProceeds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sell long put:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">+${formatNumber(recoveryLongPutSaleValue)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Profit:</span>
                    <span className={`text-lg font-bold ${
                      recoveryNetFromExit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {recoveryNetFromExit >= 0 ? '+' : ''}${formatNumber(recoveryNetFromExit)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${
                    !pathBIsBetter 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {!pathBIsBetter 
                      ? '✓ Close the position - complete exit with profit' 
                      : `Path B is ${formatNumber(recoveryReconfigureNet - recoveryNetFromExit)} better in immediate cash flow`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Path B: Reconfigure Wheel */}
            <div className={`border-2 rounded-lg p-4 ${
              pathBIsBetter && newPutExpiryValid
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                : 'border-slate-300 dark:border-slate-600'
            }`}>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <span>Path B: Reconfigure Wheel</span>
                {pathBIsBetter && newPutExpiryValid && <span className="text-amber-600 dark:text-amber-400">✓ Recommended</span>}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Sell shares + keep long put + sell new put (closer expiry than long put)
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sell shares:</span>
                  <span className="font-semibold">${formatNumber(recoveryReconfigureSharesProceeds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Keep long put:</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    (keep protection, expires in {daysRemainingOnLongPut} days)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sell new put ({newPutDaysToExpiry} days):</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +${formatNumber(recoveryReconfigureNewPutPremium)}
                  </span>
                </div>
                {!newPutExpiryValid && (
                  <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    ⚠️ New put expiry must be less than {daysRemainingOnLongPut} days
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Immediate Cash Flow:</span>
                    <span className={`text-lg font-bold ${
                      recoveryReconfigureNet >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {recoveryReconfigureNet >= 0 ? '+' : ''}${formatNumber(recoveryReconfigureNet)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Long put protection:</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      (kept for protection, expires in {daysRemainingOnLongPut} days)
                    </span>
                  </div>
                  {pathBIsBetter ? (
                    <div className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                      ✓ Better immediate cash flow than Path A - Keep long put protection and continue wheel
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Path A is {formatNumber(recoveryNetFromExit - recoveryReconfigureNet)} better - Exit recommended
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">💡 Decision Logic:</h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Step 1:</strong> After selling shares at market price, calculate if selling the long put would cover the net put cost (assignment cost + net put debit).</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Step 2a - If profitable:</strong> Sell the long put and close the position. This is the exit strategy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Step 2b - If not profitable:</strong> Keep the long put (maintain protection) and sell a new put with closer expiry than the long put to reconfigure the wheel.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Important:</strong> The new put must expire before the long put ({daysRemainingOnLongPut} days remaining) to maintain proper wheel structure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Platform Note:</strong> Your platform doesn't allow early exercise. Options can only be assigned at expiry.</span>
              </li>
            </ul>
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

