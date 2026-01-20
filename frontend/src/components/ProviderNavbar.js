// components/ProviderNavbar.jsx
import { Link } from "react-router-dom";

export default function ProviderNavbar() {
  return (
    <nav>
      <Link to="/provider/dashboard">Dashboard</Link>
      <Link to="/provider/profile">Profile</Link>
    </nav>
  );
}
