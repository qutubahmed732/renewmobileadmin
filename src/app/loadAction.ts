"use server";

const BASE_URL = "https://application.renew.org";


// ===========================  FETCH DATA FUNCTIONS START ======================= \\

// admin login function
export async function loginAction(formData: any) {
  try {
    const response = await fetch(
      `${BASE_URL}/auth/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    )

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
    const response = await fetch(
      `${BASE_URL}/admin/dashboard/stats`,
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
    const response = await 
      fetch(`${BASE_URL}/admin/videos?sortBy=createdAt&order=DESC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      })
    

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
    const response = await fetch(
      `${BASE_URL}/admin/series?sortBy=createdAt&order=DESC`,
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
    const response = await fetch(
      `${BASE_URL}/admin/small-groups?sortBy=createdAt&order=DESC`,
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

// _______________________________________________________________________________
// =============================== FETCH DATA FUNCTION END ======================== \\
// _______________________________________________________________________________

// =============================== FORGOT PASSWORD API ====================== \\


export async function forgotPasswordAction(email: string) {
  try {

    const response = await fetch(`${BASE_URL}/auth/admin/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Something went wrong. Please try again.",
      };
    }

    return {
      success: true,
      message: "Reset link sent successfully to your email.",
      data: result,
    };
  } catch (error) {
    console.error("Forgot Password Action Error:", error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }
}