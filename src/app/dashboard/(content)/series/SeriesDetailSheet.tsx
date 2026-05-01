"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, CloudUpload, Pencil, FileVideo, X } from "lucide-react"
import Image from "next/image"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export function SeriesDetailSheet({ series, open, setOpen }: any) {
  if (!series) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full! md:w-xl! p-6 overflow-y-auto border-none shadow-2xl">
       
        <VisuallyHidden.Root>
          <SheetHeader>
            <SheetTitle>{series.title}</SheetTitle>
          </SheetHeader>
        </VisuallyHidden.Root>

        
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm mb-6">
          <Image
            src={series.thumbnailUrl || "/series-placeholder.png"}
            alt={series.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          
          <div className="flex items-center gap-2 text-[#C4A052] font-semibold text-[15px]">
            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20">
              <FileVideo size={18} />
            </div>
            Series
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            <div className="md:col-span-7">
              <h2 className="text-[22px] font-bold text-slate-800 dark:text-white leading-[1.3]">
                {series.title}
              </h2>
            </div>

            
            <div className="md:col-span-5 flex flex-col gap-2">
              <Button className="w-full bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 h-10 shadow-sm gap-2 font-semibold">
                <CloudUpload size={18} />
                Upload Episode
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-slate-600 border-slate-300 h-9 text-xs font-medium">
                  Batch Upload
                </Button>
                <Button variant="outline" className="flex-1 text-rose-500 border-rose-200 hover:bg-rose-50 h-9 text-xs font-medium gap-1">
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>

              <Button variant="outline" className="w-fit px-6 text-slate-600 border-slate-300 h-9 text-xs font-medium gap-2">
                <Pencil size={14} />
                Edit
              </Button>
            </div>
          </div>

          
          <div className="pt-4">
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px] font-normal">
              {series.description || "This short series explores the content provided in the series overview."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}