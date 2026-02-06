import { useState } from "react";
import { addModel, type AddModelResponse } from "../../../../../../services/vehicleManamentService";

interface AddModelProps {
  open: boolean;
  onClose: () => void;
  makeId: string | null;
  onSuccess?: (model: AddModelResponse["data"]) => void;
}

export default function AddModel({ open, onClose, makeId, onSuccess }: AddModelProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) {
      setError("Please enter a model name.");
      return;
    }
    if (!makeId) {
      setError("Please select a manufacturer first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await addModel(makeId, name);
      if (res.status) {
        handleClose();
        onSuccess?.(res.data);
      } else {
        setError(res.message || "Failed to add model.");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to add model.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValue("");
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
          <h2 className="text-xl font-bold text-gray-800">Add Model</h2>
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
              placeholder="Enter model..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#028174]/30 focus:border-[#028174]"
            />
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
