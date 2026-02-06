import { useState } from "react";
import Sidebar from "../../../../components/Sidebar";
import CommonNavbar from "../../../../components/CommonNavbar";
import MakeModelManagment from "./MakeModelManagment/MakeModelManagment.tsx";

type TabId = "makes-models" | "manufacturing-years";

export default function VehicleManagmentMain() {
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("makes-models");

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <CommonNavbar
        collapsed={collapsed}
        onToggleSidebar={handleToggleSidebar}
        title="Vehicle Management"
      />
      <main
        className={`p-6 pt-6 mt-10 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Database of Years, Manufacturers, and Models
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-gray-200 mb-0">
          <button
            type="button"
            onClick={() => setActiveTab("makes-models")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border transition-colors -mb-px ${
              activeTab === "makes-models"
                ? "bg-[#028174] text-white border-[#028174] border-b-[#028174]"
                : "bg-gray-50 text-gray-700 border-gray-200 border-b-transparent hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Makes & Models
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manufacturing-years")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border transition-colors -mb-px ${
              activeTab === "manufacturing-years"
                ? "bg-[#028174] text-white border-[#028174] border-b-[#028174]"
                : "bg-gray-50 text-gray-700 border-gray-200 border-b-transparent hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Manufacturing Years
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === "makes-models" && <MakeModelManagment />}
          {activeTab === "manufacturing-years" && (
            <div className="bg-white rounded-lg border border-gray-100 shadow p-6">
              <p className="text-gray-500 text-sm">Manufacturing Years content will be added here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
