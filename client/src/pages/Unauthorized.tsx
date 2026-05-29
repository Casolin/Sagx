export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-red-950 to-black px-4">
      <div className="relative text-center p-10 rounded-2xl border border-red-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_40px_rgba(255,0,0,0.15)]">
        {/* glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-30 bg-red-600 rounded-2xl" />

        <div className="relative">
          <div className="text-6xl mb-4">🚫</div>

          <h1 className="text-3xl font-bold text-red-400 tracking-wide">
            Unauthorized Access
          </h1>

          <p className="text-gray-300 mt-3 text-sm max-w-sm mx-auto">
            You don’t have permission to view this page. If you think this is a
            mistake, contact your administrator.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-white font-medium shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
