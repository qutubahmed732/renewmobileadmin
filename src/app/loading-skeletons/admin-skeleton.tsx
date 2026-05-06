export default function AdminSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <>
      {rows.map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800/50">
          {/* Member Info */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </td>
          {/* Email */}
          <td className="px-6 py-4">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          </td>
          {/* Phone */}
          <td className="px-6 py-4">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </td>
          {/* Actions */}
          <td className="px-6 py-4">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}