    const SmallGroupSkeleton = () => {
  return (
    
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
          
          <td className="px-6 py-8 align-top">
            <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
          </td>

          
          <td className="px-6 py-8">
            <div className="flex gap-4">
              
              <div className="w-32 h-20 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
              
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                </div>
              </div>
            </div>
          </td>

         
          <td className="px-6 py-8 align-top" />

          
          <td className="px-6 py-8 align-top">
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto" />
          </td>

          
          <td className="px-6 py-8 align-top">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </td>

          
          <td className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-sm" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-sm" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-sm" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-sm" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default SmallGroupSkeleton;