"use server";

import { getAuthToken } from "@/lib/auth-cookies";

const BASE_URL = "https://application.renew.org";

export async function deleteVideoAction(id: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to delete video" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: "Network error occurred while deleting." };
  }
}

export async function deleteSeriesAction(id: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/series/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to delete video" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: "Network error occurred while deleting." };
  }
}

export async function deleteSmallGroupAction(id: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/small-groups/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || "Failed to delete video" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: "Network error occurred while deleting." };
  }
}

export async function deleteUserAction(id: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Failed to delete user" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: "Network error occurred while deleting." };
  }
}

export async function deleteTeamMemberAction(id: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/team-members/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || "Failed to delete team member" };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    return { success: false, error: "Network error occurred while deleting." };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.message || "Failed to update role" };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Update Role Error:", err);
    return { success: false, error: "Network error occurred." };
  }
}

export async function createTeamMemberAction(body: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  role?: string;
}) {
  const tokenID = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/team-members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenID}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, error: data.message || "Failed to create team member" };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Create Error:", err);
    return { success: false, error: "Network error occurred." };
  }
}