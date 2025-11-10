// Add this line at the top of your file
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export async function getAccessToken() {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // CRITICAL FIX 1: Check if tokens exist before trying to use them
  if (!access || !refresh) {
    // If no tokens, the user is not logged in
    throw new Error("User not authenticated.");
  }

  // Check if token expired
  const payload = JSON.parse(atob(access.split(".")[1]));
  const expiry = payload.exp * 1000; // ms

  if (Date.now() >= expiry) {
    console.log("🔄 Refreshing token...");
    
    // THE CHANGE YOU ASKED FOR: Use the API_URL variable
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
    }
      localStorage.setItem("access", data.access);
      access = data.access;
    } else {
      // CRITICAL FIX 2: If refresh fails, log the user out
      localStorage.clear();
      throw new Error("Refresh token expired — please login again.");
    }
  }

  return access;