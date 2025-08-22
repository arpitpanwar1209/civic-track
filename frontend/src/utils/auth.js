export async function getAccessToken() {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // Check if token expired
  const payload = JSON.parse(atob(access.split(".")[1]));
  const expiry = payload.exp * 1000; // ms

  if (Date.now() >= expiry) {
    console.log("🔄 Refreshing token...");
    const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access", data.access);
      access = data.access;
    } else {
      throw new Error("Refresh token expired — please login again.");
    }
  }

  return access;
}
