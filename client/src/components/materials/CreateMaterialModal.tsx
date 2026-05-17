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
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none z-50">
          {/* Header */}
          <div className="flex justify-between mb-5">
            <div>
              <Dialog.Title className="text-xl font-semibold">
                Add Material
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500">
                Create a new material entry
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <input
              placeholder="Material name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />

            <div className="flex gap-3">
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-1/2 border rounded-xl px-3 py-2"
              />

              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-1/2 border rounded-xl px-3 py-2"
              />
            </div>

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 h-20 resize-none"
            />
          </div>

          {/* Failure Types */}
          <div className="mt-5">
            <p className="text-sm font-medium mb-2">Failure Types</p>

            <div className="flex flex-wrap gap-2">
              {FAILURE_OPTIONS.map((type) => {
                const selected = failureTypes.includes(type);

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleFailure(type)}
                    className={`
                      px-3 py-1 rounded-full text-xs border transition
                      ${
                        selected
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-200 hover:border-black"
                      }
                    `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <button className="w-1/2 py-2 border rounded-xl cursor-pointer">
                Cancel
              </button>
            </Dialog.Close>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-1/2 py-2 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Material"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateMaterialModal;
