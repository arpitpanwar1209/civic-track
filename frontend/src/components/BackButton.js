import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="secondary"
      className="mb-3 d-inline-flex align-items-center"
      onClick={() => navigate(-1)}
    >
      <FaArrowLeft className="me-2" />
      Back
    </Button>
  );
}
