import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMachine, updateMachine } from "../api/machine.api";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeftToLine } from "lucide-react";

export default function EditMachinePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canEdit = isAdmin || isManager;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    description: "",
  });

  /* ================= LOAD MACHINE ================= */
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await getMachine(id);

        setForm({
          name: data.name || "",
          type: data.type || "",
          location: data.location || "",
          description: data.description || "",
        });
      } catch {
        toast.error("Failed to load machine");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (!form.name || !form.type) {
      toast.error("Name and Type are required");
      return;
    }

    try {
      setLoading(true);
      await updateMachine(id, form);
      toast.success("Machine updated successfully");
      navigate("/machines");
      //eslint-disable-next-line
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update machine";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Access denied. Admin or Manager only.
      </div>
    );
  }

  if (fetching) {
    return <div className="p-6">Loading machine...</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/machines")}
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
          >
            <ArrowLeftToLine size={16} />
            Machines
          </button>

          <h1 className="text-sm font-semibold tracking-wide text-zinc-800">
            Edit Machine
          </h1>
          <div />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* MAIN CARD */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-700">
              Machine details
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Update machine information
            </p>
          </div>

          {/* NAME */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Machine name"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* TYPE */}
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="Machine type"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* LOCATION */}
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location (optional)"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        {/* ACTION CARD */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-zinc-700">Actions</p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/machines")}
              className="w-1/2 py-2.5 rounded-xl border hover:bg-zinc-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
            >
              {loading ? "Updating..." : "Update Machine"}
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center">
            Changes are applied immediately after update
          </p>
        </div>
      </div>
    </div>
  );
}
