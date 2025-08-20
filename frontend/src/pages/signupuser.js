import React from "react";

function SignupUser() {
  return (
    <div>
      <h2>Citizen Signup</h2>
      <form>
        <input type="text" placeholder="Full Name" /><br />
        <input type="email" placeholder="Email" /><br />
        <input type="password" placeholder="Password" /><br />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignupUser;
