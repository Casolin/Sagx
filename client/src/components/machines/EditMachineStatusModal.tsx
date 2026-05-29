import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import type {
  FailureType,
  MachineCondition,
  MachineStatus,
  Machine,
} from "../../types/global.types";
import { updateMachineStatus } from "../../api/machine.api";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  machine: Machine;
  refresh: () => void;
};

export default function EditMachineStatusModal({
  open,
  onOpenChange,
  machine,
  refresh,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<MachineStatus>(machine.status);
  const [condition, setCondition] = useState<MachineCondition>(
    machine.condition,
  );
  const [failureType, setFailureType] = useState<FailureType>(
    machine.failureType,
  );

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        status,
        condition,
        failureType,
      } as {
        status: MachineStatus;
        condition: MachineCondition;
        failureType: FailureType;
      };

      await updateMachineStatus(machine._id, payload);

      toast.success("Machine status updated");
      refresh();
      onOpenChange(false);
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* OVERLAY */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" />

        {/* MODAL */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 space-y-5">
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-sm font-semibold text-zinc-800">
                  Edit Machine Status
                </Dialog.Title>
                <p className="text-xs text-zinc-500 mt-1">
                  Update machine operational state
                </p>
              </div>

              <Dialog.Close asChild>
                <button className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition">
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              {/* STATUS */}
              <div>
                <label className="text-xs text-zinc-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MachineStatus)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="OK">OK</option>
                  <option value="DOWN">DOWN</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              {/* CONDITION */}
              <div>
                <label className="text-xs text-zinc-500">Condition</label>
                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as MachineCondition)
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="ANOMALY">ANOMALY</option>
                  <option value="FAILURE">FAILURE</option>
                </select>
              </div>

              {/* FAILURE TYPE */}
              <div>
                <label className="text-xs text-zinc-500">Failure Type</label>
                <select
                  value={failureType}
                  onChange={(e) =>
                    setFailureType(e.target.value as FailureType)
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="NONE">NONE</option>
                  <option value="ELECTRICAL">ELECTRICAL</option>
                  <option value="MECHANICAL">MECHANICAL</option>
                  <option value="HYDRAULIC">HYDRAULIC</option>
                  <option value="SENSOR">SENSOR</option>
                  <option value="OVERHEAT">OVERHEAT</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
