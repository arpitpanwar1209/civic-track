import React, { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    contact: "",
    profile_pic: null, // URL string from API
  });
  const [preview, setPreview] = useState(null); // local preview for new file
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("access");
  const API = "http://127.0.0.1:8000/api/profile/";

  // Load current profile
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile({
          username: data.username || "",
          email: data.email || "",
          contact: data.contact || "",
          profile_pic: data.profile_pic || null,
        });
      } catch (e) {
        console.error(e);
        setMsg("⚠️ Failed to load profile");
      }
    }
    load();
  }, [API, token]);

  // Handle file choose
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    // store File object separately (we'll put it in FormData on save)
    setProfile((p) => ({ ...p, _file: f }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      const form = new FormData();
      // PATCH is safer so we only update provided fields
      form.append("username", profile.username);
      form.append("email", profile.email);
      form.append("contact", profile.contact);
      if (profile._file) form.append("profile_pic", profile._file);

      const res = await fetch(API, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err);
        setMsg("❌ Could not save profile");
      } else {
        const data = await res.json();
        setMsg("✅ Profile updated");
        setProfile((p) => ({
          ...p,
          profile_pic: data.profile_pic || p.profile_pic,
          _file: undefined,
        }));
        setPreview(null);
      }
    } catch (e) {
      console.error(e);
      setMsg("⚠️ Network error");
    } finally {
      setSaving(false);
    }
  };

  // Build image URL if server returned a relative path
  const imgSrc =
    preview ||
    (profile.profile_pic
      ? profile.profile_pic.startsWith("http")
        ? profile.profile_pic
        : `http://127.0.0.1:8000${profile.profile_pic}`
      : null);

  return (
    <div style={{ maxWidth: 700, margin: "30px auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>👤 My Profile</h2>
        <a href="/dashboard">↩ Dashboard</a>
      </div>

      {msg && (
        <div
          style={{
            margin: "10px 0",
            padding: "10px 12px",
            borderRadius: 8,
            background: "#f4f6f8",
          }}
        >
          {msg}
        </div>
      )}

      <form onSubmit={save} encType="multipart/form-data">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ddd",
              }}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span>no photo</span>
              )}
            </div>
            <label
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              📷 Change photo
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onFile}
              />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>
              <label>Username</label>
              <input
                name="username"
                value={profile.username}
                onChange={onChange}
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  marginTop: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={onChange}
                required
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  marginTop: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Contact</label>
              <input
                name="contact"
                value={profile.contact || ""}
                onChange={onChange}
                placeholder="Phone / other contact"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  marginTop: 6,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#2c3e50",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
