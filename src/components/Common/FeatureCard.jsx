// FeatureCard.jsx
import { Link } from "react-router-dom";
import { useTilt } from "./useTilt";
import "../LandingPage/LandingPage.css"
export default function FeatureCard({ to, icon, title, text }) {
  const tilt = useTilt();              // each instance gets its own ref
  return (
    <Link to={to} ref={tilt} className="feature-card clickable-card">
      <h3>{icon} {title}</h3>
      <p>{text}</p>
    </Link>
  );
}
