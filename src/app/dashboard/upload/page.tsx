"use client";

import { useState } from "react";
import UploadForm from "../components/UploadComponents";
import { uploadVideoAction, uploadSeriesAction, uploadSmallGroupAction } from "../../uploadAction";
import { FileVideo, Layers, Users, Calendar, ArrowLeft } from "lucide-react";

type ActiveTab = "video" | "series" | "small-group" | "gathering" | null;

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);

  const options = [
    { id: "video", label: "Video", icon: <FileVideo size={32} />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", delay: "delay-75", action: uploadVideoAction },
    { id: "series", label: "Series", icon: <Layers size={32} />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", delay: "delay-150", action: uploadSeriesAction },
    { id: "small-group", label: "Group", icon: <Users size={32} />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", delay: "delay-200", action: uploadSmallGroupAction },
    { id: "gathering", label: "Gathering", icon: <Calendar size={32} />, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", delay: "delay-300", action: null },
  ] as const;

  const handleSelection = (id: ActiveTab) => {
    if (id === "gathering") return;
    setActiveTab(id);
  };

  if (!activeTab) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 animate-in fade-in duration-700 ease-out">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">What do you want to create?</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Select an option below to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelection(opt.id as ActiveTab)}
              className={`p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-amber-500 transition-all text-left flex items-center gap-6 outline-none animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500 ${opt.delay}`}
            >
              <div className={`p-4 rounded-xl ${opt.bg} ${opt.color}`}>{opt.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{opt.label}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentOption = options.find(o => o.id === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentOption?.label} Setup</h1>
          <p className="text-slate-500 text-sm">Fill in the details below.</p>
        </div>
      </div>

      <div className="pt-2">
        <UploadForm
          key={activeTab}
          type={activeTab as any}
          onUpload={currentOption?.action as any}
          onCancel={() => setActiveTab(null)}
        />
      </div>
    </div>
  );
}