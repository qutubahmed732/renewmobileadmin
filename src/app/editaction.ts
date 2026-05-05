"use server"

const BASE_URL = "https://application.renew.org";

export async function updateVideoAction(id: string, formData: FormData, tokenID: string) {
  try {

    const res = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message || "Video update failed" };
    }

    const data = await res.json();
    return { success: true, data };

  } catch (err) {
    console.error("updateVideoAction error:", err);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateSeriesAction(id: string, formData: FormData, tokenID: string) {
  try {
    
    const body = {
      title: formData.get("title"),
      description: formData.get("description"),
      thumbnail: formData.get("thumbnail")
    }

    const res = await fetch(`${BASE_URL}/admin/series/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message || "Series update failed" };
    }

    const data = await res.json();
    return { success: true, data };

  } catch (err) {
    console.error("updateSeriesAction error:", err);
    return { success: false, error: "Something went wrong" };
  }
}

export async function updateSmallGroupAction(id: string, formData: FormData, tokenID: string) {
  try {

    const res = await fetch(`${BASE_URL}/admin/small-groups/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.message || "Small group update failed" };
    }

    const data = await res.json();
    return { success: true, data };

  } catch (err) {
    console.error("updateSmallGroupAction error:", err);
    return { success: false, error: "Something went wrong" };
  }
}

