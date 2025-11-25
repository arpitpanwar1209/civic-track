import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({
  label = "Back",
  fallback = "/dashboard",
  className = "",
  ...props
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
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
