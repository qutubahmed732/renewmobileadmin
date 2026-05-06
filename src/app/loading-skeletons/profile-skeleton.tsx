export default function ProfileSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="w-full rounded-3xl border bg-white dark:bg-[#111318] border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 animate-pulse">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">

          {/* Left — description block */}
          <div className="space-y-3 max-w-md flex-1">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-700 rounded" />
              <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          </div>

          {/* Right — input + button */}
          <div className="shrink-0 w-full md:w-64 space-y-3">
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}