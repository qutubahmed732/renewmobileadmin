"use server";

const BASE_URL = "https://application.renew.org";

export async function deleteVideoAction(id: string, tokenID: string) {
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

export async function deleteSeriesAction(id: string, tokenID: string) {
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

export async function deleteSmallGroupAction(id: string, tokenID: string) {
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