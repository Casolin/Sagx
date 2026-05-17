import AlertList from "../components/alerts/AlertList";
import { useAuth } from "../hooks/useAuth";

export default function AlertsPage() {
  const { user } = useAuth();

  const canView =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "TECHNICIAN";

  if (!canView) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold">Alerts</h1>

      <AlertList />
    </div>
  );
}
