import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams
} from "react-router-dom";

import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterOrganizer from "./pages/RegisterOrganizer";
import OrganizerAuth from "./pages/OrganizerAuth";
import Profile from "./pages/Profile";
import Waitlist from "./pages/Waitlist";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvents from "./pages/organizer/OrganizerEvents";
import OrganizerCreateEvent from "./pages/organizer/OrganizerCreateEvent";
import OrganizerEditEvent from "./pages/organizer/OrganizerEditEvent";
import OrganizerEventTickets from "./pages/organizer/OrganizerEventTickets";
import OrganizerWaitlist from "./pages/organizer/OrganizerWaitlist";
import OrganizerAnalytics from "./pages/organizer/OrganizerAnalytics";

import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";


// --------------------
// Redirect Component for old routes
// --------------------
function RedirectToProfile() {
  const { eventId } = useParams();
  return <Navigate to={`/profile/event/${eventId}`} replace />;
}


// --------------------
// Layout Component
// --------------------

function Layout() {
  const location = useLocation();

  // Detect organizer pages
  const isOrganizerPage =
    location.pathname.startsWith('/organizer') ||
    location.pathname === '/register/organizer' ||
    location.pathname === '/events/create' ||
    location.pathname === '/list-event';

  return (
    // IMPORTANT: wrapper class for organizer styles
    <div className={isOrganizerPage ? "organizer-page" : "user-page"}>
      <Header />
      <main>
        <Routes>
          {/* Public / user */}
          <Route path="/" element={<Events />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/profile/event/:eventId" element={<Profile />} />
          {/* Redirect old route to new one */}
          <Route path="/my-tickets/event/:eventId" element={<RedirectToProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/organizer" element={<RegisterOrganizer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/waitlist" element={<Waitlist />} />

          {/* Organizer */}
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/events" element={<OrganizerEvents />} />
          <Route path="/organizer/events/create" element={<OrganizerCreateEvent />} />
          <Route path="/organizer/events/:id/edit" element={<OrganizerEditEvent />} />
          <Route path="/organizer/events/:id/tickets" element={<OrganizerEventTickets />} />
          <Route path="/organizer/events/:id/waitlist" element={<OrganizerWaitlist />} />
          <Route path="/organizer/events/:id/analytics" element={<OrganizerAnalytics />} />

        </Routes>
      </main>
    </div>
  );
}


// --------------------
// Main App
// --------------------
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}
