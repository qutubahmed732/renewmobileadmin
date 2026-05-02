"use client"

import { useState, useEffect } from 'react'
import { X, Save, Upload, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: any;
}

export default function EditVideoModal({ isOpen, onClose, videoData }: EditVideoModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    series: "",
    vimeoUrl: "",
    description: "",
    isFeatured: false
  })

  useEffect(() => {
    if (videoData) {
      setFormData({
        title: videoData.title || "",
        series: videoData.series || "",
        vimeoUrl: videoData.vimeoUrl || "",
        description: videoData.description || "",
        isFeatured: videoData.isFeatured || false
      })
    }
  }, [videoData])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null;

  const handleUpdate = () => {
    console.log("Updating Data:", formData);
    onClose();
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. Custom Modal Content */}
      <div className={cn(
        "relative w-full max-w-4xl bg-white dark:bg-[#111318] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
        "animate-in fade-in zoom-in duration-200"
      )}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Video</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] p-6 space-y-6 custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Video Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vimeo Video URL</label>
            <input
              type="text"
              placeholder="Enter URL"
              value={formData.vimeoUrl}
              onChange={(e) => setFormData({ ...formData, vimeoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Video Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-800/50 w-fit">
            <input
              type="checkbox"
              id="feature"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="feature" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Feature Video</label>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Video Cover Image</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 hover:border-amber-500/30 transition-colors">
              <div className="relative w-48 h-28 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                <img
                  src={videoData?.thumbnailUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Upload size={14} className="mr-2" /> Change File
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/2 gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-semibold px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 shadow-lg shadow-amber-500/20"
          >
            Update
          </Button>
        </div>

      </div>
    </div>
  )
}