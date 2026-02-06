import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../../../../components/Sidebar";
import CommonNavbar from "../../../../components/CommonNavbar";
import { fetchGetPartCategories, deletePartCategory, type PartCategory, type PartName } from "../../../../services/partsManagmentService";
import NewCategoryDialog from "./Component/NewCategoryDialog";
import EditCategoryDialog from "./Component/EditCategoryDialog";
import NewPartNameDialog from "./Component/NewPartNameDialog";
import EditPartNameDialog from "./Component/EditPartNameDialog";

function getImageSrc(img: string | null | undefined): string | null {
  if (!img || typeof img !== "string") return null;
  if (img.startsWith("data:")) return img;
  return `data:image/png;base64,${img}`;
}

function getNameInitial(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

function CategoryListShimmer() {
  return (
    <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-5 h-5 rounded bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 h-5 rounded bg-gray-200 animate-pulse max-w-[60%]" />
          <div className="w-8 h-5 rounded-full bg-gray-200 animate-pulse shrink-0" />
        </li>
      ))}
    </ul>
  );
}

function PartsGridShimmer() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50">
          <div className="w-5 h-5 rounded bg-gray-200 animate-pulse shrink-0" />
          <div className="h-5 flex-1 max-w-[70%] rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function PartsManagment() {
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<PartCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<PartCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isNewPartNameOpen, setIsNewPartNameOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<PartName | null>(null);
  const fetchStartedRef = useRef(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGetPartCategories();
      if (res.status && Array.isArray(res.data)) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategoryId((prev) => (prev ? prev : res.data[0].cat_id));
        }
      } else {
        setError(res.message || "Failed to load part categories.");
        setCategories([]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load part categories.";
      setError(message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId !== null) {
      const exists = categories.some((c) => c.cat_id === selectedCategoryId);
      if (!exists) setSelectedCategoryId(categories[0].cat_id);
    } else if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].cat_id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.cat_id === selectedCategoryId) ?? categories[0]
    : null;
  const filteredCategories = searchQuery.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;
  const partList = selectedCategory?.part_name ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NewCategoryDialog
        open={isNewCategoryOpen}
        onClose={() => setIsNewCategoryOpen(false)}
        onSuccess={() => loadCategories()}
      />
      <EditCategoryDialog
        open={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
        category={categoryToEdit}
        onSuccess={() => loadCategories()}
      />
      <NewPartNameDialog
        open={isNewPartNameOpen}
        onClose={() => setIsNewPartNameOpen(false)}
        categoryName={selectedCategory?.name ?? ""}
        cat_id={selectedCategoryId}
        onSuccess={() => loadCategories()}
      />
      <EditPartNameDialog
        open={!!partToEdit}
        onClose={() => setPartToEdit(null)}
        part={partToEdit}
        categoryName={selectedCategory?.name ?? ""}
        onSuccess={() => loadCategories()}
      />
      {/* Delete category confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{categoryToDelete.name}</strong>?
            </p>
            {deleteError ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!categoryToDelete) return;
                  setDeleteError(null);
                  setDeleteLoading(true);
                  try {
                    const res = await deletePartCategory(categoryToDelete.cat_id);
                    if (res.status) {
                      setCategoryToDelete(null);
                      loadCategories();
                    } else {
                      setDeleteError(res.message || "Failed to delete category.");
                    }
                  } catch (e: unknown) {
                    setDeleteError(e instanceof Error ? e.message : "Failed to delete category.");
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-[#028174] text-white font-medium hover:bg-[#026b62] disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Sidebar
        collapsed={collapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <CommonNavbar
        collapsed={collapsed}
        onToggleSidebar={handleToggleSidebar}
        title="Parts Management"
      />
      <main
        className={`p-6 pt-6 mt-10 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Parts Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage auto part categories and sub-parts.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category..."
              className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#028174]/30 focus:border-[#028174]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Part Categories */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-100 shadow overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Part Categories</h2>
              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(true)}
                className="w-8 h-8 rounded flex items-center justify-center bg-[#028174] text-white hover:bg-[#026b62] transition-colors"
                aria-label="Add category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {loading ? (
              <CategoryListShimmer />
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredCategories.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-gray-500">No categories match your search.</li>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.cat_id;
                    const count = cat.part_name?.length ?? 0;
                    const catImgSrc = getImageSrc(cat.img);
                    return (
                      <li key={cat.cat_id} className={`flex items-center gap-1 ${isSelected ? "bg-[#028174]" : ""}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(cat.cat_id);
                            console.log("cat_id:", cat.cat_id);
                          }}
                          className={`flex-1 flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isSelected ? "text-white" : "hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden ${
                              catImgSrc ? "bg-white/20" : isSelected ? "bg-white/20" : "bg-[#028174]/10"
                            }`}
                          >
                            {catImgSrc ? (
                              <img src={catImgSrc} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[#028174]"}`}>
                                {getNameInitial(cat.name)}
                              </span>
                            )}
                          </span>
                          <span className="flex-1 font-medium truncate">{cat.name}</span>
                          <span
                            className={`text-sm shrink-0 rounded-full px-2 py-0.5 ${
                              isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToEdit(cat);
                          }}
                          className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90"
                          aria-label="Edit category"
                        >
                          <span
                            className={`flex items-center justify-center w-7 h-7 rounded-md border ${
                              isSelected ? "border-white text-white" : "border-gray-300 text-gray-500"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToDelete(cat);
                            setDeleteError(null);
                          }}
                          className="flex items-center justify-center w-8 h-8 shrink-0 mr-2 transition-opacity hover:opacity-90"
                          aria-label="Delete category"
                        >
                          <span
                            className={`flex items-center justify-center w-7 h-7 rounded-md border ${
                              isSelected ? "border-white text-white" : "border-gray-300 text-gray-500"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>

          {/* Right: Parts under selected category */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Parts under {selectedCategory?.name ?? "—"}
              </h2>
              <button
                type="button"
                onClick={() => setIsNewPartNameOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#028174] text-white text-sm font-medium hover:bg-[#026b62] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Part Name
              </button>
            </div>
            {loading ? (
              <PartsGridShimmer />
            ) : (
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {partList.length === 0 ? (
                    <p className="col-span-2 text-sm text-gray-500 py-4">No parts in this category.</p>
                  ) : (
                    partList.map((part) => {
                    const partImgSrc = getImageSrc(part.img);
                    return (
                      <div
                        key={part.part_name_id}
                        className="flex items-center gap-2 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-colors"
                      >
                        <span className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-[#028174]/10 text-[#028174]">
                          {partImgSrc ? (
                            <img src={partImgSrc} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-semibold">{getNameInitial(part.name)}</span>
                          )}
                        </span>
                        <span className="flex-1 font-medium text-gray-800 truncate">{part.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPartToEdit(part);
                          }}
                          className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
                          aria-label="Edit part"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete part – wire later
                          }}
                          className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
                          aria-label="Delete part"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
