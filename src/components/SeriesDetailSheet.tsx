"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription, // Add this
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2, CloudUpload, Pencil, FileVideo } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function SeriesDetailSheet({ series, open, setOpen }: any) {
  const pathname = usePathname();
  if (!series) return null;
  console.log(series.thumbnailUrl);

  const isVideosPage = pathname === "/dashboard/videos";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent 
        side="right"
        className="w-full sm:max-w-full p-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 transition-all duration-500"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>{series.title}</SheetTitle>
            <SheetDescription>
              Detailed information about {series.title}
            </SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="relative w-full aspect-video shadow-sm">
          <Image
            src={series.thumbnailUrl || "/series-placeholder.png"}
            alt={series.title}
            fill
            loading="lazy" // Lazy load image
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-[#C4A052] font-semibold text-[14px]">
            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20">
              <FileVideo size={16} />
            </div>
            {isVideosPage ? "Video Detail" : "Series"}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {series.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px]">
              {series.description || "No description available."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {!isVideosPage && (
              <>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11 shadow-sm gap-2 font-semibold">
                  <CloudUpload size={18} />
                  Upload Episode
                </Button>
                <Button variant="outline" className="w-full text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 h-10 text-sm font-medium">
                  Batch Upload
                </Button>
              </>
            )}

            <div className={isVideosPage ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}>
              <Button variant="outline" className="w-full text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-10 text-sm font-medium gap-2">
                <Trash2 size={16} />
                Delete
              </Button>
              
              <Button variant="outline" className="w-full text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 h-10 text-sm font-medium gap-2">
                <Pencil size={16} />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}