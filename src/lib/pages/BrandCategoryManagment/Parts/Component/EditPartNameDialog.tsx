import { useState, useEffect } from "react";
import type { PartName } from "../../../../../services/partsManagmentService";

interface EditPartNameDialogProps {
  open: boolean;
  onClose: () => void;
  part: PartName | null;
  categoryName: string;
  onSuccess?: () => void;
}

export default function EditPartNameDialog({
  open,
  onClose,
  part,
  categoryName,
  onSuccess,
}: EditPartNameDialogProps) {
  const [partName, setPartName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && part) {
      setPartName(part.name ?? "");
      setError(null);
    }
  }, [open, part]);

  const handleClose = () => {
    setPartName("");
    setError(null);
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Next step: wire API
    onSuccess?.();
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Edit Part Name</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-5">
          Editing part in category:{" "}
          <span className="font-semibold text-[#028174]">{categoryName || "—"}</span>
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Part Name
            </label>
            <input
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              placeholder="Enter part name..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#028174]/30 focus:border-[#028174]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#2F8A72] text-white font-semibold hover:bg-[#287a65] transition-colors"
          >
            Save Part
          </button>
        </form>
      </div>
    </div>
  );
}
