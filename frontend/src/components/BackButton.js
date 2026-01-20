import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../auth/AuthContext";

export default function BackButton({
  label = "Back",
  className = "",
  ...props
}) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }

    // Role-aware fallback
    if (user?.role === "provider") {
      navigate("/provider/dashboard", { replace: true });
    } else if (user?.role === "consumer") {
      navigate("/consumer/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <Button
      variant="secondary"
      className={`mb-3 d-inline-flex align-items-center ${className}`}
      onClick={handleBack}
      {...props}
    >
      <FaArrowLeft className="me-2" />
      {label}
    </Button>
  );
}
