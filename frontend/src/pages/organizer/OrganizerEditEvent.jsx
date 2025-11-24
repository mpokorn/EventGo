import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import OrganizerLayout from "../../components/OrganizerLayout";
import { eventService } from "../../api/eventService";
import { ticketService } from "../../api/ticketService";

import "../../styles/auth.css";
import "../../styles/organizer.css";

export default function OrganizerEditEvent() {
  const { id } = useParams();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
  });

  const [ticketTypes, setTicketTypes] = useState([]);
  const [originalTicketTypes, setOriginalTicketTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatForInput = (value) => {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 16);
  };

  // ================================
  // LOAD EVENT + TICKETS
  // ================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await eventService.getById(id);
        const data = res.data;

        setForm({
          title: data.title,
          description: data.description,
          location: data.location,
          start_datetime: formatForInput(data.start_datetime),
          end_datetime: formatForInput(data.end_datetime),
        });

        const mapped = (data.ticket_types || []).map((t) => ({
          id: t.id,
          type: t.type,
          price: t.price,
          total_tickets: t.total_tickets,
        }));

        setTicketTypes(mapped.length ? mapped : [{ id: null, type: "", price: "", total_tickets: "" }]);
        setOriginalTicketTypes(mapped);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ================================
  // FORM HANDLERS
  // ================================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updateTicket = (index, field, value) => {
    setTicketTypes((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addTicketType = () => {
    setTicketTypes((prev) => [...prev, { id: null, type: "", price: "", total_tickets: "" }]);
  };

  const removeTicketType = (index) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  // ================================
  // SAVE EVENT
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const totalTickets = ticketTypes.reduce(
        (sum, t) => sum + Number(t.total_tickets),
        0
      );

      // 1) Update event
      await eventService.update(id, {
        ...form,
        organizer_id: user.id,
        total_tickets: totalTickets,
      });

      // 2) Sync ticket types

      // Original & current sets
      const originalIds = originalTicketTypes.map((t) => t.id);
      const currentIds = ticketTypes.filter((t) => t.id).map((t) => t.id);

      // a) Deleted tickets
      const deletedIds = originalIds.filter((id) => !currentIds.includes(id));
      for (const delId of deletedIds) {
        await ticketService.delete(delId);
      }

      // b) Update existing
      for (const t of ticketTypes) {
        if (t.id) {
          await ticketService.update(t.id, {
            type: t.type,
            price: Number(t.price),
            total_tickets: Number(t.total_tickets),
          });
        }
      }

      // c) Create new ones
      for (const t of ticketTypes) {
        if (!t.id) {
          await ticketService.create({
            event_id: Number(id),
            type: t.type,
            price: Number(t.price),
            total_tickets: Number(t.total_tickets),
          });
        }
      }

      setMessage("Event updated successfully!");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Edit Event">
        <p className="org-muted" style={{ padding: "1rem" }}>
          Loading event...
        </p>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout title="Edit Event">
      <Link to="/organizer/events" className="org-back-btn">
        ← Back to Events
      </Link>

      <div className="auth-card organizer-auth-card">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Edit Event</h2>
          <p className="mt-2 text-sm text-gray-300">
            Update event details and ticket types
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* EVENT DETAILS */}
          <h3 className="org-section-title">Event Details</h3>

          <div className="form-grid">
            <div>
              <label>Title</label>
              <input name="title" required value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label>Location</label>
              <input name="location" required value={form.location} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label>Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
          </div>

          <div className="form-grid">
            <div>
              <label>Start Date & Time</label>
              <input type="datetime-local" name="start_datetime" required value={form.start_datetime} onChange={handleChange} />
            </div>
            <div>
              <label>End Date & Time</label>
              <input type="datetime-local" name="end_datetime" required value={form.end_datetime} onChange={handleChange} />
            </div>
          </div>

          {/* TICKET TYPES */}
          <h3 className="org-section-title">Ticket Types</h3>

          {ticketTypes.map((t, index) => (
            <div className="form-grid ticket-grid" key={index}>
              <div>
                <label>Type</label>
                <input
                  value={t.type}
                  onChange={(e) => updateTicket(index, "type", e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Price (€)</label>
                <input
                  type="number"
                  value={t.price}
                  onChange={(e) => updateTicket(index, "price", e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Total Tickets</label>
                <input
                  type="number"
                  value={t.total_tickets}
                  onChange={(e) => updateTicket(index, "total_tickets", e.target.value)}
                  required
                />
              </div>

              {ticketTypes.length > 1 && (
                <button type="button" className="remove-ticket-btn" onClick={() => removeTicketType(index)}>
                  ✖
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addTicketType} className="btn-secondary">
            + Add Ticket Type
          </button>

          {error && <div className="auth-error mt-4"><p>{error}</p></div>}
          {message && <div className="auth-success mt-4"><p>{message}</p></div>}

          <div className="auth-actions mt-5">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
