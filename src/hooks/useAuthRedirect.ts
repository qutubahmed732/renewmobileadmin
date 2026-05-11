"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { clearAuthCookie } from "@/lib/auth-cookies";

export function useAuthRedirect() {
  const router = useRouter();

  return useCallback(
    (result: { status?: number; success?: boolean }) => {
      if (result?.status === 401) {
        clearAuthCookie().then(() => router.push("/"));
        return true;
      }
      return false;
    },
    [router]
  );
}
