"use client"
import Image from 'next/image';


const AdminLogin = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 antialiased transition-colors duration-500 bg-slate-300 dark:bg-[#0a0c10]">

      {/* <div className="absolute top-0 -z-10 h-full w-full bg-pattern"></div> */}


      <div className="w-full max-w-md">
        <div className="font-inter rounded-2xl p-10 shadow-2xl ring-1 transition-all duration-500 bg-white/50 ring-slate-200 shadow-slate-200 dark:bg-[#111827] dark:ring-white/10 dark:shadow-black">

          <div className="flex flex-col items-center text-center">

            <div className="text-xl tracking-tight font-medium font-jakarta antialiased">
              <div className="flex w-15 h-15 items-center justify-center rounded-full overflow-hidden bg-[#172034] transition-colors">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={60}
                  height={60}
                  className="italic w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight font-jakarta antialiased transition-colors text-slate-900 dark:text-white">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-slate-400 font-inter">
              Enter your credentials to access the panel.
            </p>
          </div>

          <form className="mt-10 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                Email address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full rounded-lg border p-3.5 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white dark:placeholder-slate-600 dark:focus:border-amber-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-amber-500 hover:text-amber-400">
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border p-3.5 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white dark:placeholder-slate-600 dark:focus:border-amber-500/50"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-amber-500 py-3.5 md:text-lg font-bold tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              Sign in to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;