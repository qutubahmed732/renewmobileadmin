"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/forgotpassword"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authorized token");
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!token && !isPublicRoute) {
      // User is not logged in and trying to access a private route
      router.push("/");
    } else if (token && isPublicRoute) {
      // User is logged in and trying to access a public route (login/forgot password)
      router.push("/dashboard");
    } else {
      // Allow access
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Don't render until we have confirmed authorization state
  // to prevent UI flashing
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-[#0b0c10]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}