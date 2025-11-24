import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrganizerLayout from "../../components/OrganizerLayout";

import { eventService } from "../../api/eventService";
import { ticketService } from "../../api/ticketService";

import "../../styles/auth.css";
import "../../styles/organizer.css";

export default function OrganizerCreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
  });

  const [ticketTypes, setTicketTypes] = useState([
    { type: "", price: "", total_tickets: "" },
  ]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateTicket = (i, field, value) => {
    const updated = [...ticketTypes];
    updated[i][field] = value;
    setTicketTypes(updated);
  };

  const addTicketType = () =>
    setTicketTypes([...ticketTypes, { type: "", price: "", total_tickets: "" }]);

  const removeTicketType = (i) =>
    setTicketTypes(ticketTypes.filter((_, x) => x !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const totalTickets = ticketTypes.reduce(
        (sum, t) => sum + Number(t.total_tickets || 0),
        0
      );

      // -----------------------------
      // 1. Create Event
      // -----------------------------
      const eventRes = await eventService.create({
        ...form,
        organizer_id: user.id,
        total_tickets: totalTickets,
      });

      const eventId = eventRes.data.event.id;

      // -----------------------------
      // 2. Create Ticket Types
      // -----------------------------
      for (const t of ticketTypes) {
        await ticketService.create({
          event_id: eventId,
          type: t.type,
          price: Number(t.price),
          total_tickets: Number(t.total_tickets),
        });
      }

      // -----------------------------
      // Success - Redirect to events page
      // -----------------------------
      setMessage("Event created successfully!");

      // Redirect after a brief delay to show success message
      setTimeout(() => {
        navigate("/organizer/events");
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizerLayout title="Create Event">
      <div className="auth-card organizer-auth-card">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Create Event</h2>
          <p className="mt-2 text-sm text-gray-300">
            Fill out event details and ticket types
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* EVENT DETAILS */}
          <h3 className="org-section-title">Event Details</h3>

          <div className="form-grid">
            <div>
              <label>Title</label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Location</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid">
            <div>
              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                name="start_datetime"
                required
                value={form.start_datetime}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                name="end_datetime"
                required
                value={form.end_datetime}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* TICKET TYPES */}
          <h3 className="org-section-title">Ticket Types</h3>

          {ticketTypes.map((t, i) => (
            <div className="form-grid ticket-grid" key={i}>
              <div>
                <label>Type</label>
                <input
                  placeholder="VIP"
                  value={t.type}
                  onChange={(e) =>
                    updateTicket(i, "type", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label>Price (€)</label>
                <input
                  type="number"
                  placeholder="20"
                  value={t.price}
                  onChange={(e) =>
                    updateTicket(i, "price", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label>Total Tickets</label>
                <input
                  type="number"
                  placeholder="50"
                  value={t.total_tickets}
                  onChange={(e) =>
                    updateTicket(i, "total_tickets", e.target.value)
                  }
                  required
                />
              </div>

              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  className="remove-ticket-btn"
                  onClick={() => removeTicketType(i)}
                >
                  ✖
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addTicketType} className="btn-secondary">
            + Add Ticket Type
          </button>

          {/* ERRORS / SUCCESS */}
          {error && <div className="auth-error mt-4"><p>{error}</p></div>}
          {message && <div className="auth-success mt-4"><p>{message}</p></div>}

          <div className="auth-actions mt-5">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
