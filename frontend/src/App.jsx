import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#222" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>EventGo</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </Router>
  );
}
