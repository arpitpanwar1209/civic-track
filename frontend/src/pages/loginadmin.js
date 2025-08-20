import React from "react";

function LoginAdmin() {
  return (
    <div>
      <h2>Admin Login</h2>
      <form>
        <input type="text" placeholder="Admin Username" /><br />
        <input type="password" placeholder="Password" /><br />
        <button type="submit">Login as Admin</button>
      </form>
    </div>
  );
}

export default LoginAdmin;
