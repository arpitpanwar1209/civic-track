import React from "react";

function LoginUser() {
  return (
    <div>
      <h2>Citizen Login</h2>
      <form>
        <input type="text" placeholder="Username" /><br />
        <input type="password" placeholder="Password" /><br />
        <button type="submit">Login as Citizen</button>
      </form>
    </div>
  );
}

export default LoginUser;
