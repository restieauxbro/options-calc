import Link from 'next/link';

export default function CustomPage() {
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
                <span className="text-2xl">🎯</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Custom Calculator
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Build your own advanced options strategy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Custom Strategy Calculator
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            This calculator is coming soon! It will give you complete freedom to build complex multi-leg options strategies.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 text-left mb-8">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Planned Features:
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Add unlimited option legs (calls, puts, spreads)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Build complex strategies (iron condors, butterflies, straddles)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Visual profit/loss diagrams
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Greeks analysis (Delta, Gamma, Theta, Vega)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Save and compare multiple strategies
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                Export analysis to PDF
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

