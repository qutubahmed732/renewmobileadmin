"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './loadAction';
import { verifyMfaLoginAction } from './MFAactions';
import Link from 'next/link';

type Login = {
  email: String,
  password: String,
  rememberMe: true,
  platform: "IOS",
  deviceId: "string"
}

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function LoginHandler(e: any) {
    e.preventDefault();

    const loginData: Login = {
      email: email,
      password: password,
      rememberMe: true,
      platform: "IOS",
      deviceId: "string"
    };

    try {
      setLoading(true);
      const result = await loginAction(loginData);

      if (result) {
        console.log("Login Result:", result);

        const responseData = result.data?.data || result.data;

        // Check if MFA is required
        if (result.status === 403 || result.status === 401 || responseData?.mfaRequired || responseData?.mfaToken || responseData?.challengeToken || responseData?.challengeId || responseData?.factorId) {
          console.log("MFA Challenge required:", responseData);
          setMfaToken(responseData?.challengeToken || responseData?.mfaToken || responseData?.challengeId || responseData?.factorId || "dummy_token");
          return;
        }

        const token = responseData?.accessToken;

        if (token) {
          localStorage.setItem("authorized token", token);
          console.log("Token saved in local storage as 'authorized token'");
          router.push("/dashboard");
        } else {
          console.error("Token not found in response body", result);
          alert(`Login succeeded but no token found. Response: ${JSON.stringify(responseData)}`);
        }
      } else {
        console.error("Login Failed:", result);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function VerifyMfaHandler(e: any) {
    e.preventDefault();
    if (!mfaToken || !mfaCode) return;

    try {
      setLoading(true);
      const result = await verifyMfaLoginAction(mfaCode, mfaToken);

      if (result?.success) {
        const token = result?.data?.data?.accessToken;
        if (token) {
          localStorage.setItem("authorized token", token);
          router.push("/dashboard");
        } else {
          console.error("Final Token not found in MFA verify response");
        }
      } else {
        console.error("MFA Verification Failed:", result);
        alert(`Verification Failed: ${result?.data?.message || result?.message || "Invalid MFA Code. Please try again."}`);
      }
    } catch (error) {
      console.error("MFA Network Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 antialiased transition-colors duration-500 bg-slate-300 dark:bg-[#0a0c10]">

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
              {mfaToken ? "Enter your 6-digit authenticator code." : "Enter your credentials to access the panel."}
            </p>
          </div>

          {mfaToken ? (
            <form className="mt-10 space-y-5" onSubmit={VerifyMfaHandler}>
              <div>
                <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                  Authenticator Code
                </label>
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="w-full rounded-lg border p-3.5 outline-none transition-all text-center tracking-[0.5em] text-2xl font-mono focus:ring-2 focus:ring-amber-500/20 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white dark:placeholder-slate-600 dark:focus:border-amber-500/50"
                />
              </div>

              <div className='flex items-center justify-between mt-2'>
                <button type="button" onClick={() => setMfaToken(null)} className="text-sm font-medium text-slate-500 hover:text-slate-400">
                  Back to login
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length < 6}
                className="mt-4 w-full rounded-lg bg-amber-500 py-3.5 md:text-lg font-bold tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          ) : (
            <form className="mt-10 space-y-5" onSubmit={LoginHandler}>
            <div>
              <label className="mb-2 block text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400">
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); console.log(email); }}
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
              </div>
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); console.log(password) }}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border p-3.5 outline-none transition-all focus:ring-2 focus:ring-amber-500/20 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white dark:placeholder-slate-600 dark:focus:border-amber-500/50"
              />
            </div>

            <div className='flex items-center justify-end'>
              <Link href="/forgotpassword" className="text-sm font-medium text-amber-500 hover:text-amber-400">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-amber-500 py-3.5 md:text-lg font-bold tracking-wide text-black transition-all hover:bg-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;