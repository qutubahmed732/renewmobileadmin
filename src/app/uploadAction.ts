"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const BASE_URL = "https://application.renew.org";

export async function createContentAction(
  type: string,
  prevState: any,
  formData: FormData
) {
  let endpoint = "";
  switch (type) {
    case "videos": endpoint = "/admin/videos"; break;
    case "series": endpoint = "/admin/series"; break;
    case "small-group": endpoint = "/admin/small-groups"; break;
    default: return { error: "Invalid content type", success: false };
  }

  try {
    const token = "YOUR_AUTH_TOKEN";

    if (type === "small-group" && !formData.get("createdById")) {
        formData.append("createdById", "your-admin-id-here"); 
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        error: result.message || `Failed to create ${type}`, 
        success: false 
      };
    }

    revalidatePath(`/dashboard/${type}`);
    
  } catch (error) {
    return { error: "Network error occurred", success: false };
  }

  redirect(`/dashboard/${type}`);
}