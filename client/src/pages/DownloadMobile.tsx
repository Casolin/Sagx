import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone } from "lucide-react";

export default function DownloadMobile() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apkUrl =
    "https://github.com/Casolin/Sagx/releases/download/App/sagx.apk"; // replace

  const handleDownload = async () => {
    try {
      setLoading(true);

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = apkUrl;
        link.download = "app.apk";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-linear-to-b from-gray-950 via-gray-900 to-black text-white z-100">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur hover:bg-white/20 transition active:scale-95 cursor-pointer"
      >
        ← Back
      </button>

      {/* CONTENT */}
      <div className="w-full max-w-xl text-center">
        {/* ICON */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold tracking-tight">
          Download Mobile App
        </h1>

        <p className="text-gray-400 mt-3 text-sm leading-relaxed">
          Install the latest Android version of the app.
          <br />
          Fast • Secure • Lightweight
        </p>

        {/* CARD */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">
            ⚡ Before installing
          </h2>

          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Enable “Install unknown apps” on Android</li>
            <li>• Use latest version for best performance</li>
            <li>• Works best on Android 9+</li>
          </ul>
        </div>

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="mt-8 w-full py-3 rounded-xl font-semibold bg-white text-black hover:bg-gray-200 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Preparing Download..." : "Download APK"}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Version 1.0.0 • Android APK
        </p>

        <p className="text-[11px] text-gray-600 mt-6 leading-relaxed">
          If installation fails, check your Android security settings and allow
          installation from this source.
        </p>
      </div>
    </div>
  );
}
