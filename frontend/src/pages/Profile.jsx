import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import DashboardSidebar from "../components/DashBoardSidebar";
import Modal from "../components/Modal";

import ProfileAccount from "./profile_sections/ProfileAccount";
import ProfileTickets from "./profile_sections/ProfileTickets";
import ProfileWaitlist from "./profile_sections/ProfileWaitlist";
import ProfileEvents from "./profile_sections/ProfileEvents";
import ProfileTransactions from "./profile_sections/ProfileTransactions";
import ProfileEventTickets from "./profile_sections/ProfileEventTickets";

import "../styles/dashboard.css";
import "../styles/profile.css";

export default function Profile() {
  const { user } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(eventId ? "event-tickets" : "profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", onConfirm: null });

  // Update section when eventId changes in URL
  useEffect(() => {
    if (eventId) {
      setSection("event-tickets");
    }
  }, [eventId]);

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    oldPassword: "",
    password: ""
  });

  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* UPDATE PROFILE DATA WHEN USER CONTEXT CHANGES */
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        oldPassword: "",
        password: ""
      });
    }
  }, [user]);

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

        // Load transactions
        const txRes = await api.get(`/transactions/user/${user.id}`);
        setTransactions(txRes.data.transactions || []);

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
    setError("");
    setSuccess("");

    // Validate password change logic
    if (profileData.password && !profileData.oldPassword) {
      setError("Please enter your current password to change it.");
      return;
    }

    setSaving(true);

    try {
      const payload = { ...profileData };
      if (!payload.password) {
        delete payload.password;
        delete payload.oldPassword;
      }

      await api.put(`/users/${user.id}`, payload);
      setSuccess("Profile updated!");
      
      // Clear password fields after successful update
      setProfileData(prev => ({ ...prev, oldPassword: "", password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };


  /* HANDLE TICKET REFUND/RETURN */
  const handleResell = async (ticketId, eventId) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Return Ticket to Waitlist",
      message: "Your ticket will be offered to the waitlist. You'll keep access until someone else accepts it. You will receive a refund of 98% of the ticket price (2% platform fee).",
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        try {
          const res = await api.put(`/tickets/${ticketId}/refund`);

          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: res.data.message,
            onConfirm: null
          });

          // Refresh tickets & waitlist
          const tkRes = await api.get(`/tickets/user/${user.id}`);
          setTickets(tkRes.data.tickets || []);

          const wlRes = await api.get(`/waitlist/user/${user.id}`);
          setWaitlist(wlRes.data.waitlist || []);

        } catch (err) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: err.response?.data?.message || "Error refunding ticket.",
            onConfirm: null
          });
        }
      }
    });
  };

  /* HANDLE ACCEPT RESERVED TICKET */
  const handleAcceptTicket = async (transactionId) => {
    try {
      const res = await api.post(`/waitlist/accept-ticket/${transactionId}`);
      setModal({
        isOpen: true,
        type: "alert",
        title: "Success",
        message: res.data.message,
        onConfirm: null
      });

      // Refresh tickets
      const tkRes = await api.get(`/tickets/user/${user.id}`);
      setTickets(tkRes.data.tickets || []);
    } catch (err) {
      setModal({
        isOpen: true,
        type: "alert",
        title: "Error",
        message: err.response?.data?.message || "Error accepting ticket.",
        onConfirm: null
      });
    }
  };

  /*  HANDLE DECLINE RESERVED TICKET */
  const handleDeclineTicket = async (transactionId) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Decline Ticket Offer",
      message: "Are you sure you want to decline this ticket offer?",
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        try {
          const res = await api.post(`/waitlist/decline-ticket/${transactionId}`);
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: res.data.message,
            onConfirm: null
          });

          // Refresh tickets
          const tkRes = await api.get(`/tickets/user/${user.id}`);
          setTickets(tkRes.data.tickets || []);
        } catch (err) {
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: err.response?.data?.message || "Error declining ticket.",
            onConfirm: null
          });
        }
      }
    });
  };


  /* SPLIT RESERVED, ACTIVE, PENDING RETURN & EXPIRED TICKETS */
  const now = new Date();
  
  const reservedTickets = tickets.filter((t) => t?.status === "reserved");
  
  const pendingReturnTickets = tickets.filter((t) => t?.status === "pending_return");
  
  const activeTickets = tickets.filter((t) => {
    if (t?.status === "reserved" || t?.status === "refunded" || t?.status === "pending_return") return false;
    
    const end = t?.end_datetime ? new Date(t.end_datetime) : null;
    const start = t?.start_datetime ? new Date(t.start_datetime) : null;

    if (end instanceof Date && !isNaN(end)) return end > now;
    if (start instanceof Date && !isNaN(start)) return start > now;

    return true;
  });

  const refundedTickets = tickets.filter((t) => t?.status === "refunded");

  const expiredTickets = tickets.filter((t) => {
    if (t?.status === "reserved" || t?.status === "refunded" || t?.status === "pending_return") return false;
    
    const end = t?.end_datetime ? new Date(t.end_datetime) : null;
    const start = t?.start_datetime ? new Date(t.start_datetime) : null;

    if (end instanceof Date && !isNaN(end)) return end <= now;
    if (start instanceof Date && !isNaN(start)) return start <= now;

    return false;
  });


  const handleSectionChange = (newSection) => {
    setSection(newSection);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar 
        section={section} 
        setSection={handleSectionChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
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
              pendingReturnTickets={pendingReturnTickets}
              refundedTickets={refundedTickets}
              expiredTickets={expiredTickets}
              loading={loading}
              onResell={handleResell}
              onAccept={handleAcceptTicket}
              onDecline={handleDeclineTicket}
              events={events}
            />
          )}

          {section === "waitlist" && (
            <ProfileWaitlist waitlist={waitlist} loading={loading} />
          )}

          {section === "events" && (
            <ProfileEvents events={events} loading={loading} />
          )}

          {section === "transactions" && (
            <ProfileTransactions transactions={transactions} tickets={tickets} loading={loading} />
          )}

          {section === "event-tickets" && eventId && (
            <ProfileEventTickets eventId={eventId} onBack={() => {
              navigate("/profile");
              setSection("events");
            }} />
          )}

        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
