export default function VideoSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <>
      {rows.map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-white/5">
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="shrink-0 w-20 md:w-24 h-12 md:h-14 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col gap-2 min-w-0">
                <div className="h-4 w-32 md:w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-24 md:w-32 bg-slate-100 dark:bg-slate-800/50 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded italic" />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="mx-auto h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <div className="h-8 w-8 xl:w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-8 w-8 xl:w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}