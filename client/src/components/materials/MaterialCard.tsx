import { useState } from "react";
import type { Material } from "../../types/global.types";
import { updateMaterialStock, deleteMaterial } from "../../api/material.api";
import { Trash2 } from "lucide-react";
import ConfirmModal from "../ConfirmModal";

interface Props {
  material: Material;
}

const MaterialCard = ({ material }: Props) => {
  const failureTypes = material.failureTypes ?? [];
  const hasFailures = failureTypes.length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(material.quantity);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      const updated = await updateMaterialStock(material._id, quantity);

      setQuantity(updated.quantity);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      await deleteMaterial(material._id);

      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete material");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className="
      group relative overflow-hidden
      rounded-2xl border border-gray-200/70
      bg-white
      p-5
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-2xl
    "
    >
      {/* LEFT ACCENT BAR */}
      <div className="absolute left-0 top-0 h-full w-1 bg-linear-to-b from-blue-500 via-cyan-400 to-indigo-500 opacity-80" />
      {/* FLOATING GLOW */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition" />
      {/* HEADER */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
            {material.name}
          </h2>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {material.description?.trim()
              ? material.description
              : "No description available"}
          </p>
        </div>

        {/* STATUS CHIP */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

          {!isEditing ? (
            <span
              onClick={() => setIsEditing(true)}
              className="
              cursor-pointer
              text-xs font-semibold
              px-3 py-1.5
              rounded-full
              bg-gray-100 text-gray-700
              border border-gray-200
              hover:bg-gray-200
              transition
            "
            >
              {quantity} {material.unit}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs border rounded-md"
              />

              <button
                onClick={handleSave}
                disabled={loading}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md"
              >
                {loading ? "..." : "Save"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setQuantity(material.quantity);
                }}
                className="text-xs text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {/* DIVIDER */}
      <div className="my-4 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
      {/* FAILURE ZONE */}
      <div className="relative">
        {hasFailures ? (
          <div className="flex flex-wrap gap-2">
            {failureTypes.map((type, idx) => (
              <span
                key={`${type}-${idx}`}
                className="
                text-xs font-semibold
                px-2.5 py-1
                rounded-full
                bg-red-50 text-red-600
                border border-red-100
                hover:bg-red-100
                transition
              "
              >
                {type}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            No failure reports detected
          </div>
        )}
      </div>
      {/* BOTTOM MICRO INFO STRIP */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
        <span>Inventory module</span>
        <button
          onClick={() => setDeleteOpen(true)}
          className="
    p-2 rounded-lg
    text-gray-400
    hover:text-red-600
    hover:bg-red-50
    transition
  "
          title="Delete material"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Material"
        message={`Are you sure you want to delete "${material.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        variant="danger"
        onConfirm={handleDelete}
      />
      ;
    </div>
  );
};

export default MaterialCard;
