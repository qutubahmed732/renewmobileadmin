"use server";

const BASE_URL = "https://application.renew.org";
const FETCH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Helper function for fetch with timeout and retry
async function fetchWithTimeoutAndRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (attempt === retries - 1) throw error;
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  throw new Error("Failed after retries");
}

// ===========================  FETCH DATA FUNCTIONS START ======================= \\

// admin login function
export async function loginAction(formData: any) {
  try {
    const response = await fetchWithTimeoutAndRetry(
      `${BASE_URL}/auth/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      data: data,
      status: response.status,
    };
  } catch (error: any) {
    console.error("LOGIN_ERROR:", error);
    return {
      success: false,
      message: "Internal Server Error",
      error: error,
    };
  }
}

// users fetching function
export async function getUsersAction(token: string | null) {
  try {
    const response = await fetchWithTimeoutAndRetry(
      `${BASE_URL}/admin/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error,
    };
  }
}

// videos fetching function
export async function getVideosAction(token: string | null) {
  try {
    const response = await fetchWithTimeoutAndRetry(
      `${BASE_URL}/admin/videos?sortBy=createdAt&order=ASC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error,
    };
  }
}

// series fetching function
export async function getSeriesAction(token: string | null) {
  try {
    const response = await fetchWithTimeoutAndRetry(
      `${BASE_URL}/admin/series?sortBy=createdAt&order=ASC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error,
    };
  }
}

// getsmallgroups fetching function
export async function getSmallGroupsAction(token: string | null) {
  try {
    const response = await fetchWithTimeoutAndRetry(
      `${BASE_URL}/admin/small-groups?sortBy=createdAt&order=ASC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error,
    };
  }
}

// getTeam members fetching function
export async function getTeamMembersAction(token: string | null) {
  try {
    const response = await fetch(`${BASE_URL}/admin/team-members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      }
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data
    };

  } catch (error: any) {
    return {
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error
    };
  }
}

// =============================== FETCH DATA FUNCTION END ======================== \\

// ---------------------------------- \\


// =============================== EDIT DATA FUNCTION START ======================= \\



// =============================== EDIT DATA FUNCTION END ========================= \\