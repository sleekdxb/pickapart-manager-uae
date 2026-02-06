import { useState, useEffect } from "react";
import {
  fetchGetMakeModels,
  deleteMake,
  deleteModel,
  type Make,
  type MakeModel,
} from "../../../../../services/vehicleManamentService";
import AddMakes from "./Component/AddMakes";
import EditMakes from "./Component/EditMakes";
import AddModel from "./Component/AddModel";
import EditModel from "./Component/EditModel";

function toImageSrc(img: string): string {
  if (!img || typeof img !== "string") return "";
  if (img.startsWith("data:")) return img;
  return `data:image/png;base64,${img}`;
}

function ManufacturerLogo({
  name,
  img,
  selected,
}: {
  name: string;
  img: string | null;
  selected: boolean;
}) {
  const initial = name.charAt(0);
  if (img) {
    const src = toImageSrc(img);
    return (
      <img
        src={src}
        alt={name}
        className={`w-10 h-10 rounded-full object-cover shrink-0 ${
          selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#028174]" : ""
        }`}
      />
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
        selected ? "bg-[#026b62] text-white" : "bg-gray-200 text-gray-600"
      }`}
    >
      {initial}
    </div>
  );
}

export default function MakeModelManagment() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [makes, setMakes] = useState<Make[]>([]);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [addMakeOpen, setAddMakeOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<Make | null>(null);
  const [deletingMake, setDeletingMake] = useState<Make | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<MakeModel | null>(null);
  const [deletingModel, setDeletingModel] = useState<MakeModel | null>(null);
  const [deleteModelLoading, setDeleteModelLoading] = useState(false);
  const [deleteModelError, setDeleteModelError] = useState<string | null>(null);

  const refetchMakes = async () => {
    try {
      const res = await fetchGetMakeModels();
      if (res.status && Array.isArray(res.data)) {
        setMakes(res.data);
        setSuccess("Makes and models updated.");
      }
    } catch {
      // Keep existing data on refetch error
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetchGetMakeModels();
        if (cancelled) return;
        if (res.status && Array.isArray(res.data)) {
          setMakes(res.data);
          setSuccess("Makes and models loaded.");
          if (res.data.length > 0) {
            setSelectedMakeId((prev) => (prev ? prev : res.data[0].make_id));
          }
        } else {
          setError("No data received.");
          setMakes([]);
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load makes and models.";
        setError(message);
        setMakes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMake = selectedMakeId
    ? makes.find((m) => m.make_id === selectedMakeId)
    : null;
  const models: MakeModel[] = selectedMake?.model ?? [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-100 shadow p-6 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-sm">Loading makes and models...</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow p-6 flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow p-6">
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <AddMakes
        open={addMakeOpen}
        onClose={() => setAddMakeOpen(false)}
        onSuccess={() => {
          setAddMakeOpen(false);
          refetchMakes();
        }}
      />
      <EditMakes
        open={!!editingMake}
        make={editingMake}
        onClose={() => setEditingMake(null)}
        onSuccess={() => {
          setEditingMake(null);
          refetchMakes();
        }}
      />
      {/* Delete confirmation */}
      {deletingMake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Make</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deletingMake.name}</strong>?
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
                  setDeletingMake(null);
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
                  setDeleteError(null);
                  setDeleteLoading(true);
                  try {
                    const res = await deleteMake(deletingMake.make_id);
                    if (res.status) {
                      setDeletingMake(null);
                      refetchMakes();
                    } else {
                      setDeleteError(res.message || "Failed to delete manufacturer.");
                    }
                  } catch (e: unknown) {
                    setDeleteError(e instanceof Error ? e.message : "Failed to delete manufacturer.");
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
      <AddModel
        open={addModelOpen}
        onClose={() => setAddModelOpen(false)}
        makeId={selectedMakeId}
        onSuccess={() => {
          setAddModelOpen(false);
          refetchMakes();
        }}
      />
      <EditModel
        open={!!editingModel}
        model={editingModel}
        onClose={() => setEditingModel(null)}
        onSuccess={() => {
          setEditingModel(null);
          refetchMakes();
        }}
      />
      {/* Delete model confirmation */}
      {deletingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white w-full max-w-sm rounded-xl shadow-xl p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Model</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deletingModel.name}</strong>?
            </p>
            {deleteModelError ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {deleteModelError}
              </div>
            ) : null}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeletingModel(null);
                  setDeleteModelError(null);
                }}
                disabled={deleteModelLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  setDeleteModelError(null);
                  setDeleteModelLoading(true);
                  try {
                    const res = await deleteModel(deletingModel.model_id);
                    if (res.status) {
                      setDeletingModel(null);
                      refetchMakes();
                    } else {
                      setDeleteModelError(res.message || "Failed to delete model.");
                    }
                  } catch (e: unknown) {
                    setDeleteModelError(e instanceof Error ? e.message : "Failed to delete model.");
                  } finally {
                    setDeleteModelLoading(false);
                  }
                }}
                disabled={deleteModelLoading}
                className="px-4 py-2 rounded-lg bg-[#028174] text-white font-medium hover:bg-[#026b62] disabled:opacity-60"
              >
                {deleteModelLoading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Manufacturers */}
      <div className="lg:col-span-1 bg-white rounded-lg border border-gray-100 shadow overflow-hidden flex flex-col">
        {success ? (
          <div className="mb-2 px-4 py-1 text-xs text-emerald-600 bg-emerald-50 border-b border-emerald-100">
            {success}
          </div>
        ) : null}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Manufacturers</h2>
          <button
            type="button"
            onClick={() => setAddMakeOpen(true)}
            className="w-8 h-8 rounded flex items-center justify-center bg-[#028174] text-white hover:bg-[#026b62] transition-colors"
            aria-label="Add manufacturer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {makes.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-gray-500">No manufacturers yet.</li>
          ) : (
            makes.map((m) => {
              const isSelected = selectedMakeId === m.make_id;
              const modelCount = m.model?.length ?? 0;
              return (
                <li
                  key={m.make_id}
                  className={`flex items-center gap-1 ${isSelected ? "bg-[#028174]" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMakeId(m.make_id)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? "text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    <ManufacturerLogo name={m.name} img={m.img} selected={isSelected} />
                    <span className="flex-1 font-medium truncate">{m.name}</span>
                    <span className={`text-sm ${isSelected ? "text-white/90" : "text-gray-500"}`}>
                      {modelCount} Model{modelCount !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMake(m);
                    }}
                    className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90"
                    aria-label="Edit make"
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
                      setDeletingMake(m);
                      setDeleteError(null);
                    }}
                    className="flex items-center justify-center w-8 h-8 shrink-0 mr-2 transition-opacity hover:opacity-90"
                    aria-label="Delete make"
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
      </div>

      {/* Right panel: Models for selected manufacturer */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-800">
            Models for {selectedMake?.name ?? "—"}
          </h2>
          <button
            type="button"
            onClick={() => setAddModelOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#028174] text-white text-sm font-medium hover:bg-[#026b62] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Model
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.length === 0 ? (
              <p className="col-span-2 text-sm text-gray-500 py-4">
                No models for this manufacturer.
              </p>
            ) : (
              models.map((model) => (
                <div
                  key={model.model_id}
                  className="flex items-center gap-2 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-[#028174] flex items-center justify-center text-white text-lg font-semibold shrink-0">
                    {model.name.charAt(0)}
                  </div>
                  <span className="flex-1 font-medium text-gray-800 truncate">{model.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(model.model_id);
                      setEditingModel(model);
                    }}
                    className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
                    aria-label="Edit model"
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
                      setDeletingModel(model);
                      setDeleteModelError(null);
                    }}
                    className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-90 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100"
                    aria-label="Delete model"
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
