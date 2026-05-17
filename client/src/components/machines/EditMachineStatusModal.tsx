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
    } catch {
      toast.error("Failed to update machine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* OVERLAY */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md transition-opacity" />

        {/* MODAL */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl space-y-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-gray-800">
              Edit Machine Status
            </Dialog.Title>

            <Dialog.Close asChild>
              <button className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* FORM */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MachineStatus)}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="OK">OK</option>
                <option value="DOWN">DOWN</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Condition</label>
              <select
                value={condition}
                onChange={(e) =>
                  setCondition(e.target.value as MachineCondition)
                }
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="ANOMALY">ANOMALY</option>
                <option value="FAILURE">FAILURE</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Failure Type</label>
              <select
                value={failureType}
                onChange={(e) => setFailureType(e.target.value as FailureType)}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
