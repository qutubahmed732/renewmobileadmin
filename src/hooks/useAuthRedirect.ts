"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuthRedirect() {
  const router = useRouter();

  return useCallback(
    (result: { status?: number; success?: boolean }) => {
      if (result?.status === 401) {
        localStorage.removeItem("authorized token");
        router.push("/");
        return true;
      }
      return false;
    },
    [router]
  );
}