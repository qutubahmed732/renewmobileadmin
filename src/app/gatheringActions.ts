"use server";

import { getAuthToken } from "@/lib/auth-cookies";

const BASE_URL = "https://application.renew.org";

export async function getGatheringDetailAction(id: string) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function getGatheringsAction() {
  const token = await getAuthToken();
  try {
    const response = await fetch(
      `${BASE_URL}/admin/gatherings?sortBy=createdAt&order=DESC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function createGatheringAction(formData: FormData) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function updateGatheringAction(id: string, formData: FormData) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function createGatheringTrackVideoSessionAction(gatheringId: string, trackId: string, formData: FormData) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings/${gatheringId}/tracks/${trackId}/video-upload-sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function createGatheringTrackAction(gatheringId: string, formData: FormData) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings/${gatheringId}/tracks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function updateGatheringTrackAction(gatheringId: string, trackId: string, formData: FormData) {
  const token = await getAuthToken();
  try {
    const response = await fetch(`${BASE_URL}/admin/gatherings/${gatheringId}/tracks/${trackId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function deleteGatheringTrackAction(gatheringId: string, trackId: string) {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/gatherings/${gatheringId}/tracks/${trackId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || "Failed to delete track" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error occurred." };
  }
}

export async function updateEpisodeSpeakersAction(
  gatheringId: string,
  trackId: string,
  episodeId: string,
  speakers: { name: string; sortOrder?: number }[]
) {
  const token = await getAuthToken();
  try {
    const response = await fetch(
      `${BASE_URL}/admin/gatherings/${gatheringId}/tracks/${trackId}/episodes/${episodeId}/speakers`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speakers }),
      }
    );
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { rawText: text }; }
    return { success: response.ok, status: response.status, data };
  } catch (error: any) {
    return { success: false, status: 500, message: "Internal Server Error", error };
  }
}

export async function deleteGatheringAction(id: string) {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/gatherings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.message || "Failed to delete gathering" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error occurred." };
  }
}
