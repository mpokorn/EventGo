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

  /* LOAD ALL PROFILE DATA */
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const tkRes = await api.get(`/tickets/user/${user.id}`);
        const userTickets = tkRes.data.tickets || [];
        setTickets(userTickets);

        // Extract unique event IDs from tickets and fetch those events
        const eventIds = [...new Set(userTickets.map(t => t.event_id).filter(Boolean))];
        if (eventIds.length > 0) {
          const eventPromises = eventIds.map(id => api.get(`/events/${id}`));
          const eventResponses = await Promise.all(eventPromises);
          const userEvents = eventResponses.map(res => res.data);
          setEvents(userEvents);
        } else {
          setEvents([]);
        }

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

  /* AUTO RELOAD TICKETS WHEN ENTERING TICKETS SECTION */
  useEffect(() => {
    const reloadTickets = async () => {
      if (!user) return;
      
      try {
        const tkRes = await api.get(`/tickets/user/${user.id}`);
        setTickets(tkRes.data.tickets || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (section === "tickets") reloadTickets();
  }, [section, user?.id]);


  /* HANDLE PROFILE CHANGES */
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


  /* 🎫 HANDLE TICKET REFUND */
  const handleResell = async (ticketId, eventId) => {
    if (!window.confirm("Are you sure you want to refund this ticket?")) return;

    try {
      const res = await api.put(`/tickets/${ticketId}/refund`);

      alert(res.data.message);

      // Refresh tickets & waitlist
      const tkRes = await api.get(`/tickets/user/${user.id}`);
      setTickets(tkRes.data.tickets || []);

      const wlRes = await api.get(`/waitlist/user/${user.id}`);
      setWaitlist(wlRes.data.waitlist || []);

    } catch (err) {
      alert(err.response?.data?.message || "Error refunding ticket.");
    }
  };

  /* 🎫 HANDLE ACCEPT RESERVED TICKET */
  const handleAcceptTicket = async (transactionId) => {
    try {
      const res = await api.post(`/waitlist/accept-ticket/${transactionId}`);
      alert(res.data.message);

      // Refresh tickets
      const tkRes = await api.get(`/tickets/user/${user.id}`);
      setTickets(tkRes.data.tickets || []);
    } catch (err) {
      alert(err.response?.data?.message || "Error accepting ticket.");
    }
  };

  /*  HANDLE DECLINE RESERVED TICKET */
  const handleDeclineTicket = async (transactionId) => {
    if (!window.confirm("Are you sure you want to decline this ticket offer?")) return;

    try {
      const res = await api.post(`/waitlist/decline-ticket/${transactionId}`);
      alert(res.data.message);

      // Refresh tickets
      const tkRes = await api.get(`/tickets/user/${user.id}`);
      setTickets(tkRes.data.tickets || []);
    } catch (err) {
      alert(err.response?.data?.message || "Error declining ticket.");
    }
  };


  /* SPLIT RESERVED, ACTIVE & EXPIRED TICKETS */
  const now = new Date();
  
  const reservedTickets = tickets.filter((t) => t?.status === "reserved");
  
  const activeTickets = tickets.filter((t) => {
    if (t?.status === "reserved" || t?.status === "refunded") return false;
    
    const end = t?.end_datetime ? new Date(t.end_datetime) : null;
    const start = t?.start_datetime ? new Date(t.start_datetime) : null;

    if (end instanceof Date && !isNaN(end)) return end > now;
    if (start instanceof Date && !isNaN(start)) return start > now;

    return true;
  });

  const expiredTickets = tickets.filter((t) => {
    if (t?.status === "reserved" || t?.status === "refunded") return false;
    
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
              reservedTickets={reservedTickets}
              activeTickets={activeTickets}
              expiredTickets={expiredTickets}
              loading={loading}
              onResell={handleResell}
              onAccept={handleAcceptTicket}
              onDecline={handleDeclineTicket}
            />
          )}

          {section === "waitlist" && (
            <ProfileWaitlist waitlist={waitlist} loading={loading} />
          )}

          {section === "events" && (
            <ProfileEvents events={events} loading={loading} />
          )}

        </div>
      </div>
    </div>
  );
}
