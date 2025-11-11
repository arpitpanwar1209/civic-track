import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import BackButton from "../components/BackButton";
const API_URL = process.env.REACT_APP_API_URL;

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    const res = await fetch(`${API_URL}/api/accounts/password-reset-confirm/${uid}/${token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMsg("✅ Password reset successful!");
      setTimeout(() => nav("/login"), 1500);
    } else {
      setMsg(data.detail || "Invalid or expired reset link.");
    }
  };

  
<Container className="py-4">
  <BackButton />
  {/* rest of content */}
</Container>

  return (
    <div className="container p-5">
      <h3>Reset Password</h3>
      <input className="form-control my-3" type="password" placeholder="New Password"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn btn-primary" onClick={submit}>Reset Password</button>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  );
}
