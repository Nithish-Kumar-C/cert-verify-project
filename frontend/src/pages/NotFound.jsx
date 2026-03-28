import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="notfound">
      <div className="notfound__code">404</div>
      <h1 className="notfound__title">Page Not Found</h1>
      <p className="notfound__sub">The page you are looking for does not exist.</p>
      <Button variant="primary" onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );
}

export default NotFound;
