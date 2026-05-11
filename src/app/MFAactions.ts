"use server";

import { getAuthToken } from "@/lib/auth-cookies";

const BASE_URL = "https://application.renew.org";

// ______________________________ MFA FUNCTIONS _____________________

export async function verifyMfaLoginAction(code: string, mfaToken: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/admin/mfa/verify-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // TODO: Adjust exact JSON keys based on your backend
      body: JSON.stringify({ code, challengeToken: mfaToken }),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    console.error("MFA_VERIFY_LOGIN_ERROR:", error);
    return { success: false, message: "Network error", error };
  }
}

// 2. Get MFA Status
export async function getMfaStatusAction() {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/auth/admin/mfa/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    return { success: false, message: "Network error", error };
  }
}

// 3. Setup MFA
export async function setupMfaAction(currentPassword?: string) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/auth/admin/mfa/totp/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword }),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    return { success: false, message: "Network error", error };
  }
}

// 4. Verify MFA Setup
export async function verifyMfaSetupAction(code: string, factorId: string) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/auth/admin/mfa/totp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      // TODO: Adjust exact JSON key if backend expects 'token' instead of 'code'
      body: JSON.stringify({ code, factorId }),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    return { success: false, message: "Network error", error };
  }
}

// 5. Disable MFA
export async function disableMfaAction(currentPassword?: string, code?: string) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/auth/admin/mfa/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, code }),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error: any) {
    return { success: false, message: "Network error", error };
  }
}