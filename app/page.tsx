import Link from 'next/link';

export default function Home() {
  const strategies = [
    {
      id: 'protect',
      title: 'Protect Your Position',
      icon: '🛡️',
      description: 'Lock in gains or limit losses with protective puts',
      tag: 'Defensive',
      tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      features: [
        'Add protective puts to limit downside',
        'Set a floor price for your position',
        'Calculate new break-even points',
        'Analyze different exit scenarios'
      ],
      available: true
    },
    {
      id: 'income',
      title: 'Generate Income',
      icon: '💰',
      description: 'Earn premium income with covered calls',
      tag: 'Income',
      tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      features: [
        'Sell covered calls for premium',
        'Calculate income potential',
        'Balance upside cap vs. income',
        'Optimize strike selection'
      ],
      available: false
    },
    {
      id: 'collar',
      title: 'Collar Strategy',
      icon: '⚖️',
      description: 'Balance protection and income generation',
      tag: 'Combined',
      tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      features: [
        'Combine puts and calls',
        'Reduce cost of protection',
        'Define risk/reward range',
        'Zero-cost collar options'
      ],
      available: false
    },
    {
      id: 'wheel',
      title: 'Wheel Strategy',
      icon: '🎡',
      description: 'Initiate wheel strategy with short and long puts',
      tag: 'Income',
      tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      features: [
        'Sell short-dated cash-secured put',
        'Buy long-dated protective put',
        'Calculate breakeven with covered calls',
        'Track premium collection goals'
      ],
      available: true
    },
    {
      id: 'custom',
      title: 'Custom Calculator',
      icon: '🎯',
      description: 'Build your own advanced options strategy',
      tag: 'Advanced',
      tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      features: [
        'Multiple legs and positions',
        'Complex strategy builder',
        'Greeks analysis',
        'Profit/loss charts'
      ],
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Options Strategy Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Choose a strategy that fits your trading goals
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={strategy.available ? `/${strategy.id}` : '#'}
              className={`block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                strategy.available 
                  ? 'hover:scale-[1.02] cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{strategy.icon}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {strategy.title}
                    </h2>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${strategy.tagColor}`}>
                      {strategy.tag}
                    </span>
                  </div>
                </div>
                {!strategy.available && (
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {strategy.description}
              </p>
              
              <ul className="space-y-2">
                {strategy.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {strategy.available && (
                <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                  Open Calculator
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                New to Options Strategies?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start with <strong>Protect Your Position</strong> if you want to limit downside risk on existing holdings.
                Each calculator includes explanations and real-time scenario analysis to help you understand the potential outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
