import React from "react";

function LoginOfficial() {
  return (
    <div>
      <h2>Government Official Login</h2>
      <form>
        <input type="text" placeholder="Official ID" /><br />
        <input type="password" placeholder="Password" /><br />
        <button type="submit">Login as Official</button>
      </form>
    </div>
  );
}

export default LoginOfficial;
