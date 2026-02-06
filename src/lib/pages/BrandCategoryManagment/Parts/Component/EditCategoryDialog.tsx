import { useState, useRef, useEffect } from "react";
import { updatePartCategory, type PartCategory } from "../../../../../services/partsManagmentService";

interface EditCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category: PartCategory | null;
  onSuccess?: () => void;
}

function getImageSrc(img: string | null | undefined): string | null {
  if (!img || typeof img !== "string") return null;
  if (img.startsWith("data:")) return img;
  return `data:image/png;base64,${img}`;
}

export default function EditCategoryDialog({ open, onClose, category, onSuccess }: EditCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill when category is set and dialog opens
  useEffect(() => {
    if (open && category) {
      setCategoryName(category.name ?? "");
      setImageFile(null);
      setImagePreviewUrl(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, category]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleClose = () => {
    if (loading) return;
    setCategoryName("");
    setImageFile(null);
    setImagePreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  // Display: new file preview, else existing category image, else placeholder
  const displayImageSrc = imagePreviewUrl ?? (category ? getImageSrc(category.img) : null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) {
      setError("Please enter a category name.");
      return;
    }
    if (!category) return;
    setError(null);
    setLoading(true);
    try {
      const res = await updatePartCategory(category.cat_id, name, imageFile);
      if (res.status) {
        onSuccess?.();
        handleClose();
      } else {
        setError(res.message || "Failed to update category.");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update category.";
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Category</h2>
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

        <form onSubmit={handleSave} className="space-y-5">
          {error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {/* Category Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#028174]/30 focus:border-[#028174]"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Category Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="w-full min-h-[140px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors text-gray-500 overflow-hidden"
            >
              {displayImageSrc ? (
                <>
                  <img
                    src={displayImageSrc}
                    alt="Category preview"
                    className="w-full h-[160px] object-cover"
                  />
                  <span className="text-xs text-gray-500 py-1">Click to change image</span>
                </>
              ) : (
                <>
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
                  <span className="text-sm text-gray-400">Click to upload image</span>
                </>
              )}
            </button>
          </div>

          {/* Update Category */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#2F8A72] text-white font-semibold hover:bg-[#287a65] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Update Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
