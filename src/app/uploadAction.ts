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