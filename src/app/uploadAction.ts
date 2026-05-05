"use server";

const BASE_URL = "https://application.renew.org";

export async function uploadVideoAction(token: string | null, formData: FormData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/videos`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Video upload failed",
      error: error.message,
    };
  }
}

export async function uploadSeriesAction(token: string | null, formData: FormData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/series`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Series upload failed",
      error: error.message,
    };
  }
}

export async function uploadSmallGroupAction(token: string | null, formData: FormData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/small-groups`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Small Group upload failed",
      error: error.message,
    };
  }
}

// =============================== TUS UPLOAD ACTIONS ===============================

export async function createVideoSessionAction(token: string | null, formData: FormData) {
  try {
    const response = await fetch(`${BASE_URL}/admin/videos/upload-sessions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      // Do NOT set Content-Type, fetch will automatically set it to multipart/form-data with the correct boundary
      body: formData,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawText: text }; // Not JSON!
    }

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to create video upload session",
      error: error.message || String(error),
    };
  }
}

export async function completeVideoUploadAction(token: string | null, videoId: string | number) {
  try {
    const response = await fetch(`${BASE_URL}/admin/videos/${videoId}/complete-upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawText: text }; // Not JSON!
    }

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to complete video upload",
      error: error.message || String(error),
    };
  }
}