import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <header className="app-header">
          <nav className="app-nav">
            <Link to="/" className="app-brand">
              EventGo
            </Link>
          </nav>
        </header>

        <main className="app-main">
          <div className="layout-container">
            <Routes>
              <Route path="/" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
