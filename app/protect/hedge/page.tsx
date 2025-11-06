import Link from 'next/link';
import HedgeCalculator from '../components/HedgeCalculator';

export default function HedgePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/protect"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Hedge & Hold Strategy
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add protective options while staying in position
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="py-8 px-4">
        <HedgeCalculator />
      </div>
    </div>
  );
}



