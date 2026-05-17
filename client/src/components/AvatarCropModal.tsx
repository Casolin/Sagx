import Cropper from "react-easy-crop";
import { useState } from "react";
import getCroppedImg from "../utils/cropImage";

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  image: string;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void>;
};

export default function AvatarCropModal({ image, onCancel, onSave }: Props) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const onCropComplete = (_: CropArea, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setLoading(true);

    try {
      const blob = await getCroppedImg(image, croppedAreaPixels);
      await onSave(blob);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white w-[320px] h-95 rounded-lg flex flex-col overflow-hidden">
        <div className="relative flex-1 bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex justify-between p-3 bg-white">
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-200 rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 text-white rounded cursor-pointer"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
