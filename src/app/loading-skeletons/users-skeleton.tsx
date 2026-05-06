export default function UsersSkeleton() {
  const rows = Array.from({ length: 8 });

  return (
    <>
      {rows.map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
          {/* User Info */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </td>
          {/* Contact */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </td>
          {/* Phone */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </td>
          {/* SignUp Date */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </td>
          {/* Status */}
          <td className="px-6 py-4">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </td>
          {/* Action */}
          <td className="px-6 py-4 text-right">
            <div className="ml-auto h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}