import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertList from "../components/alerts/AlertList";
import { useAuth } from "../hooks/useAuth";

export default function AlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const canView =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "TECHNICIAN";

  useEffect(() => {
    if (!canView) {
      navigate("/unauthorized", { replace: true });
    }
  }, [canView, navigate]);

  if (!canView) return null;

  return (
    <div className="p-6 space-y-6 bg-[#f9f9f9] min-h-screen">
      <h1 className="text-4xl font-black tracking-tight">Alerts</h1>
      <AlertList />
    </div>
  );
}
