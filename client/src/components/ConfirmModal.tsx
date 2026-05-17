import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "danger" | "primary";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
  onOpenChange,
  onConfirm,
}: Props) {
  const confirmColor =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none z-50">
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={18} />
            </button>
          </Dialog.Close>

          <Dialog.Title className="text-lg font-semibold text-gray-800">
            {title}
          </Dialog.Title>

          <Dialog.Description className="text-sm text-gray-600 mt-2">
            {message}
          </Dialog.Description>

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <button
                disabled={loading}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                {cancelText}
              </button>
            </Dialog.Close>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${confirmColor} cursor-pointer`}
            >
              {loading ? "Loading..." : confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
