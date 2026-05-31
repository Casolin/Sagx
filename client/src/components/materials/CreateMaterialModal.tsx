import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { createMaterial } from "../../api/material.api";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const FAILURE_OPTIONS = [
  "NONE",
  "ELECTRICAL",
  "MECHANICAL",
  "HYDRAULIC",
  "SENSOR",
  "OVERHEAT",
  "UNKNOWN",
] as const;

type FailureType = (typeof FAILURE_OPTIONS)[number];

const CreateMaterialModal = ({ open, onOpenChange, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");
  const [failureTypes, setFailureTypes] = useState<FailureType[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleFailure = (type: FailureType) => {
    setFailureTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const resetForm = () => {
    setName("");
    setQuantity(0);
    setUnit("pcs");
    setDescription("");
    setFailureTypes([]);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);

      await createMaterial({
        name: name.trim(),
        quantity,
        unit,
        description: description.trim(),
        failureTypes,
      });

      toast.success("Material added successfully");
      window.location.reload();

      resetForm();
      onCreated();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add material",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* OVERLAY */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

        {/* MODAL */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-5">
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-sm font-semibold text-zinc-800">
                  Add Material
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-500 mt-1">
                  Create a new inventory material
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              {/* NAME */}
              <input
                placeholder="Material name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />

              {/* QUANTITY + UNIT */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Quantity"
                  className="px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                />

                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit (pcs, kg...)"
                  className="px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              {/* DESCRIPTION */}
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 h-24 resize-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* FAILURE TAGS */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Failure Types</p>

              <div className="flex flex-wrap gap-2">
                {FAILURE_OPTIONS.map((type) => {
                  const selected = failureTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleFailure(type)}
                      className={`
                      px-3 py-1.5 rounded-full text-xs border transition
                      ${
                        selected
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                      }
                    `}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition">
                  Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition"
              >
                {loading ? "Adding..." : "Add Material"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateMaterialModal;
