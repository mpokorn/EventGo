import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import DashboardSidebar from "../components/DashBoardSidebar";


import ProfileAccount from "./profile_sections/ProfileAccount";
import ProfileTickets from "./profile_sections/ProfileTickets";
import ProfileWaitlist from "./profile_sections/ProfileWaitlist";
import ProfileEvents from "./profile_sections/ProfileEvents";

import "../styles/dashboard.css";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth();

  const [section, setSection] = useState("profile");

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name,
    last_name: user?.last_name,
    email: user?.email,
    password: ""
  });

  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [waitlist, setWaitlist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === "organizer") {
          const evRes = await api.get("/events");
          setEvents(evRes.data);
        }

        const tkRes = await api.get(`/tickets/user/${user.id}`); // /user/:user_id
        setTickets(tkRes.data.tickets || []);

        const wlRes = await api.get(`/waitlist/user/${user.id}`);
        setWaitlist(wlRes.data.waitlist || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Allow manual reload when switching to Tickets section (e.g., after purchase)
  useEffect(() => {
    const reloadTickets = async () => {
      try {
        const tkRes = await api.get(`/tickets/user/${user.id}`);
        setTickets(tkRes.data.tickets || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (section === "tickets") reloadTickets();
  }, [section, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...profileData };
      if (!payload.password) delete payload.password;

      await api.put(`/users/${user.id}`, payload);
      setSuccess("Profile updated!");

    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // split tickets
  const now = new Date();
  const activeTickets = tickets.filter((t) => {
    const end = t?.end_datetime ? new Date(t.end_datetime) : null;
    const start = t?.start_datetime ? new Date(t.start_datetime) : null;
    if (end instanceof Date && !isNaN(end)) return end > now;
    if (start instanceof Date && !isNaN(start)) return start > now;
    return t?.status !== "refunded"; // default to active if no dates
  });
  const expiredTickets = tickets.filter((t) => {
    const end = t?.end_datetime ? new Date(t.end_datetime) : null;
    const start = t?.start_datetime ? new Date(t.start_datetime) : null;
    if (end instanceof Date && !isNaN(end)) return end <= now;
    if (start instanceof Date && !isNaN(start)) return start <= now;
    return false;
  });

  return (
    <div className="dashboard-layout">
      <DashboardSidebar section={section} setSection={setSection} />
      <div className="dashboard-main">
        <div className="dashboard-content">
          {section === "profile" && (
            <ProfileAccount
              profileData={profileData}
              handleChange={handleChange}
              handleSave={handleSave}
              saving={saving}
              error={error}
              success={success}
            />
          )}

          {section === "tickets" && (
            <ProfileTickets
              activeTickets={activeTickets}
              expiredTickets={expiredTickets}
              loading={loading}
            />
          )}

          {section === "waitlist" && (
            <ProfileWaitlist
              waitlist={waitlist}
              loading={loading}
            />
          )}

          {section === "events" && user.role === "organizer" && (
            <ProfileEvents events={events} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
