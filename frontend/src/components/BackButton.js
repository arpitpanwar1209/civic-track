// frontend/src/components/BackButton.js
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({ fallback = "/dashboard" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <Button
      variant="outline-secondary"
      size="sm"
      className="mb-3 d-inline-flex align-items-center"
      onClick={handleBack}
    >
      <FaArrowLeft className="me-2" />
      Back
    </Button>
  );
}
