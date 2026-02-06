import { useState, useEffect } from "react";
import { addPartName, type AddPartNameData } from "../../../../../services/partsManagmentService";

interface NewPartNameDialogProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  cat_id: string | null;
  onSuccess?: (data: AddPartNameData) => void;
}

export default function NewPartNameDialog({ open, onClose, categoryName, cat_id, onSuccess }: NewPartNameDialogProps) {
  const [partName, setPartName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPartName("");
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    setPartName("");
    setError(null);
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = partName.trim();
    if (!name) {
      setError("Please enter a part name.");
      return;
    }
    if (!cat_id) {
      setError("Please select a category first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await addPartName(cat_id, name);
      if (res.status && res.data) {
        onSuccess?.(res.data);
        handleClose();
      } else {
        setError(res.message || "Failed to add part name.");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add part name.";
      setError(message);
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-xl font-bold text-gray-800">New Part Name</h2>
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
          Adding part to category:{" "}
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
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#2F8A72] text-white font-semibold hover:bg-[#287a65] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Part"}
          </button>
        </form>
      </div>
    </div>
  );
}
