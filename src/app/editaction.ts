"use server"

const BASE_URL = "https://application.renew.org";

/** Strips empty file inputs from FormData so the backend doesn't receive a 0-byte file field */
function stripEmptyFiles(formData: FormData): FormData {
  const clean = new FormData();
  formData.forEach((value, key) => {
    if (value instanceof File) {
      if (value.size > 0) clean.append(key, value); // only keep if real file selected
    } else {
      clean.append(key, value);
    }
  });
  return clean;
}

export async function updateVideoAction(id: string, formData: FormData, tokenID: string) {
  try {
    const body = stripEmptyFiles(formData);

    const res = await fetch(`${BASE_URL}/admin/videos/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Video update failed";
      try { errMsg = JSON.parse(text)?.message || errMsg; } catch { errMsg = text || errMsg; }
      return { success: false, error: errMsg };
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
    const body = stripEmptyFiles(formData);

    const res = await fetch(`${BASE_URL}/admin/series/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Series update failed";
      try { errMsg = JSON.parse(text)?.message || errMsg; } catch { errMsg = text || errMsg; }
      return { success: false, error: errMsg };
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
    const body = stripEmptyFiles(formData);

    const res = await fetch(`${BASE_URL}/admin/small-groups/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenID}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Small group update failed";
      try { errMsg = JSON.parse(text)?.message || errMsg; } catch { errMsg = text || errMsg; }
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    return { success: true, data };

  } catch (err) {
    console.error("updateSmallGroupAction error:", err);
    return { success: false, error: "Something went wrong" };
  }
}
