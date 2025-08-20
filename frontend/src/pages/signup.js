import React from "react";

function Signup() {
  return (
    <div>
      <h2>Signup</h2>
      <form>
        <input type="text" placeholder="Username" /><br />
        <input type="email" placeholder="Email" /><br />
        <input type="password" placeholder="Password" /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
