import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-purple-50 overflow-hidden">
      {/* Decorative Gradient Orbs */}
      <div className="absolute -top-20 -right-16 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-orange-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-tr from-purple-300/30 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-8 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-orange-200/20 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-[480px] relative">
        {/* Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-200/50 border border-white/60 overflow-hidden">
          <div className="relative px-8 py-10 sm:px-10 text-center">

            <div className="flex items-center justify-center gap-1 select-none">
              <span className="text-7xl sm:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 leading-none">
                4
              </span>
              <span className="text-7xl sm:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 leading-none">
                0
              </span>
              <span className="text-7xl sm:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 leading-none">
                4
              </span>
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight">
              Page not found
            </h1>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 focus:outline-none transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="w-32 h-1 bg-orange-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
