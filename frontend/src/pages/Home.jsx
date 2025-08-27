import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-8">
              <span className="text-4xl">💸</span>
            </div>
            <h1 className="text-6xl font-black text-white mb-6">
              Splitwise
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              The easiest way to split bills with friends and family. 
              Track expenses, settle debts, and keep everyone happy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white hover:text-emerald-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Splitwise?
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fair, and transparent expense sharing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">⚖️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fair Splitting</h3>
              <p className="text-gray-600">
                Split expenses equally or by custom amounts. Everyone pays their fair share.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-teal-50 border border-teal-100">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track Everything</h3>
              <p className="text-gray-600">
                Keep track of all expenses and see who owes what at a glance.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">💳</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Easy Settlement</h3>
              <p className="text-gray-600">
                Settle up with friends quickly and keep your relationships money-stress free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start splitting smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who trust Splitwise for their expense sharing needs.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
} 