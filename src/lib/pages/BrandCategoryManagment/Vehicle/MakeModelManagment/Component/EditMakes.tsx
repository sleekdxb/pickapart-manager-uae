import { useState, useRef, useEffect } from "react";
import { updateMake, type Make } from "../../../../../../services/vehicleManamentService";

function toImageSrc(img: string | null): string {
  if (!img || typeof img !== "string") return "";
  if (img.startsWith("data:")) return img;
  return `data:image/png;base64,${img}`;
}

interface EditMakesProps {
  open: boolean;
  make: Make | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditMakes({ open, make, onClose, onSuccess }: EditMakesProps) {
  const [value, setValue] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (make) {
      setValue(make.name);
      setLogoFile(null);
      if (make.img) {
        setLogoPreview(toImageSrc(make.img));
      } else {
        setLogoPreview(null);
      }
    }
  }, [make]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) {
      setError("Please enter a make name.");
      return;
    }
    if (!make) return;
    setLoading(true);
    setError(null);
    try {
      const res = await updateMake(make.make_id, name, logoFile);
      if (res.status) {
        handleClose();
        onSuccess?.();
      } else {
        setError(res.message || "Failed to update manufacturer.");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update manufacturer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValue("");
    setLogoFile(null);
    setLogoPreview(null);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Make</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {/* VALUE */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter make..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#028174]/30 focus:border-[#028174]"
            />
          </div>

          {/* MANUFACTURER LOGO */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Manufacturer Logo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-[#028174]/50 hover:bg-gray-50/50 transition-colors"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
              <span className="text-sm text-gray-400">Click to upload logo</span>
            </button>
          </div>

          {/* Save Changes */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#028174] text-white font-semibold hover:bg-[#026b62] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
