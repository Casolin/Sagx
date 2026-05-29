import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="relative w-full max-w-md text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-lg">
        {/* subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-2xl opacity-40" />

        <div className="relative">
          <div className="flex justify-center mb-4 text-red-400">
            <ShieldAlert size={42} />
          </div>

          <h1 className="text-xl font-semibold text-white">Unauthorized</h1>

          <p className="text-sm text-white/60 mt-2 leading-relaxed">
            You don’t have permission to access this page.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
