import * as Dialog from "@radix-ui/react-dialog";

export const CallBusyModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-xl z-50 bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">
            User Busy
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-sm text-gray-600">
            This user is already in a call. Please try again later.
          </Dialog.Description>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded bg-black px-4 py-2 text-white"
            >
              OK
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
