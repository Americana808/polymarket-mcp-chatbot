import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// Chat widget state moved to App root; no local state needed here.

export function Canvas() {
  return (
    <div className="min-h-dvh relative bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-10 w-full">
        <div className="px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 relative">
            {/* Name of Website*/}
            <div className="flex-shrink-0">
              <span className="text-white font-semibold text-lg tracking-tight">
                PolyView
              </span>
            </div>

            {/* Nav */}
            <nav className="hidden lg:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="cursor-pointer text-base font-normal text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <Link
                to="/charts"
                className="text-base font-normal text-gray-400 hover:text-white transition-colors"
              >
                Charts
              </Link>
              <Link
                to="/articles"
                className="text-base font-normal text-gray-400 hover:text-white transition-colors"
              >
                Articles
              </Link>
              <Link
                to="/recent"
                className="text-base font-normal text-gray-400 hover:text-white transition-colors"
              >
                Recent
              </Link>
            </nav>

            {/* Right actions (no login; CTA is Get Started) */}
            <div className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-6 sm:ml-auto">
              <div className="relative inline-flex items-center justify-center group">
                <div className="absolute -inset-px rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-cyan-500/50" />
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative inline-flex items-center justify-center px-5 py-2.5 text-base font-normal text-white bg-black border border-transparent rounded-full"
                  aria-label="Get Started"
                >
                  Get Started
                </a>
              </div>
            </div>

            {/* Mobile menu button (non-functional placeholder) */}
            <button
              type="button"
              className="inline-flex p-2 ml-1 text-white/80 transition-colors rounded-md sm:ml-4 lg:hidden hover:bg-white/10 focus:bg-white/10"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative lg:min-h-[1000px] pt-24 pb-12 sm:pt-32 sm:pb-20 lg:pb-28 bg-black">
        {/* Floating demo cards (replace credit cards with charts/articles) */}
        <div className="absolute inset-x-0 bottom-10 z-10 hidden lg:flex items-end justify-center gap-10 pb-10">
          {/* Charts card */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="pointer-events-none absolute -z-10 bottom-6 left-1/2 -translate-x-1/2 h-48 w-[560px] bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 blur-3xl" />
            <motion.div
              id="charts"
              initial={{ y: 40, opacity: 0, rotate: -4 }}
              animate={{ y: 0, opacity: 1, rotate: -2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/40 w-[520px] h-[320px] overflow-hidden"
            >
              {/* Charts image */}
              <img
                src="/charts.JPG"
                alt="Charts preview"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              {/* Subtle frame overlay */}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
            </motion.div>
          </div>

          {/* Articles card */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="pointer-events-none absolute -z-10 bottom-6 left-1/2 -translate-x-1/2 h-48 w-[560px] bg-gradient-to-r from-cyan-500 to-purple-500 opacity-30 blur-3xl" />
            <motion.div
              id="articles"
              initial={{ y: 50, opacity: 0, rotate: 5 }}
              animate={{ y: 0, opacity: 1, rotate: 3 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.08 }}
              className="relative z-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/40 w-[520px] h-[320px] overflow-hidden"
            >
              {/* Articles image */}
              <img
                src="/articles.JPG"
                alt="Articles preview"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              {/* Subtle frame overlay */}
              <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />
            </motion.div>
          </div>
        </div>

        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              <span className=" bg-clip-text  text-gray-300">
                Smarter market insights powered by AI
              </span>
            </h1>
            <p className="mt-5 text-base text-gray-300 sm:text-xl">
              Analyze Polymarket trends, forecast outcomes, and uncover
              opportunities
            </p>
            <div className="flex items-center justify-center mt-8 sm:mt-16">
              <div className="relative inline-flex items-center justify-center group">
                <div className="absolute -inset-px rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-cyan-500/50" />
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative inline-flex items-center px-8 py-3 text-base font-normal text-white bg-black border border-transparent rounded-full"
                  aria-label="Get Started"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section id="features" className="relative py-32 bg-black">
        <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.2em] text-gray-50 mb-4">
              REIMAGINING MARKET INSIGHT
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Designed for deeper insight <span className="italic">and</span>{" "}
              better decisions.
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              PolyView brings prices, predictions, and context together so you
              can focus on what actually moves the market.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              Ask questions, surface emerging markets before they spike, and
              watch other traders' large bets.
            </p>
            <div className="grid sm:grid-cols-2 gap-8 mt-10">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="font-semibold mb-2">Recent Trades</h3>
                <p className="text-sm text-gray-300">
                  See the latest trades across Polymarket in real time. Filter
                  by side and explore momentum as it happens.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="font-semibold mb-2">Live Market Charts</h3>
                <p className="text-sm text-gray-300">
                  Visualize price swings, volume spikes, and probability shifts
                  with live charts built for better decision making.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="font-semibold mb-2">Relevant Articles</h3>
                <p className="text-sm text-gray-300">
                  Get short informational articles on markets you follow;
                  curated to add context and confidence to every move.
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="font-semibold mb-2">AI Chat Assistant</h3>
                <p className="text-sm text-gray-300">
                  Ask questions, explore scenarios, and get quick insights that
                  help you understand odds and form smarter & better
                  predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat widget and toggle moved to App root for global persistence */}
    </div>
  );
}
