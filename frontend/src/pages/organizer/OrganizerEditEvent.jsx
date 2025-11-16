import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OrganizerLayout from "../../components/OrganizerLayout";
import "../../styles/auth.css";
import "../../styles/organizer.css";

export default function OrganizerEditEvent() {
  const { id } = useParams();         // event id from URL
  const navigate = useNavigate();
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Format DB datetime for <input type="datetime-local">
  const formatForInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    // yyyy-MM-ddTHH:mm
    return d.toISOString().slice(0, 16);
  };

  // Load event + ticket types
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/events/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load event");

        setForm({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          start_datetime: formatForInput(data.start_datetime),
          end_datetime: formatForInput(data.end_datetime),
        });

        const mappedTickets =
          (data.ticket_types || []).map((t) => ({
            id: t.id,
            type: t.type,
            price: t.price,
            total_tickets: t.total_tickets,
          })) || [];

        setTicketTypes(mappedTickets.length ? mappedTickets : [
          { id: null, type: "", price: "", total_tickets: "" },
        ]);

        setOriginalTicketTypes(mappedTickets);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updateTicket = (index, field, value) => {
    setTicketTypes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { id: null, type: "", price: "", total_tickets: "" },
    ]);
  };

  const removeTicketType = (index) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      // Total tickets = sum of all ticket type totals
      const totalTickets = ticketTypes.reduce(
        (sum, t) => sum + Number(t.total_tickets || 0),
        0
      );

      // 1) Update event
      const eventRes = await fetch(`http://localhost:5000/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizer_id: user.id,
          total_tickets: totalTickets,
        }),
      });

      const eventData = await eventRes.json();
      if (!eventRes.ok) throw new Error(eventData.message || "Failed to update event");

      // 2) Sync ticket types

      // original ids
      const originalIds = originalTicketTypes.map((t) => t.id);
      const currentIds = ticketTypes.filter((t) => t.id).map((t) => t.id);

      // a) delete removed ticket types
      const deletedIds = originalIds.filter((id) => !currentIds.includes(id));
      for (const delId of deletedIds) {
        await fetch(`http://localhost:5000/ticket-types/${delId}`, {
          method: "DELETE",
        });
      }

      // b) update existing
      const existingTickets = ticketTypes.filter((t) => t.id);
      for (const t of existingTickets) {
        await fetch(`http://localhost:5000/ticket-types/${t.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: t.type,
            price: Number(t.price),
            total_tickets: Number(t.total_tickets),
          }),
        });
      }

      // c) create new ones
      const newTickets = ticketTypes.filter((t) => !t.id);
      for (const t of newTickets) {
        await fetch(`http://localhost:5000/ticket-types`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: Number(id),
            type: t.type,
            price: Number(t.price),
            total_tickets: Number(t.total_tickets),
          }),
        });
      }

      setMessage("Event updated successfully!");
      // Optionally navigate back after a delay:
      // setTimeout(() => navigate("/organizer/events"), 1000);
    } catch (err) {
      console.error(err);
      setError(err.message);
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

          {ticketTypes.map((t, index) => (
            <div className="form-grid ticket-grid" key={index}>
              <div>
                <label>Type</label>
                <input
                  placeholder="VIP"
                  value={t.type}
                  onChange={(e) =>
                    updateTicket(index, "type", e.target.value)
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
                    updateTicket(index, "price", e.target.value)
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
                    updateTicket(index, "total_tickets", e.target.value)
                  }
                  required
                />
              </div>

              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  className="remove-ticket-btn"
                  onClick={() => removeTicketType(index)}
                >
                  ✖
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTicketType}
            className="btn-secondary"
          >
            + Add Ticket Type
          </button>

          {error && (
            <div className="auth-error mt-4">
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="auth-success mt-4">
              <p>{message}</p>
            </div>
          )}

          <div className="auth-actions mt-5">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </OrganizerLayout>
  );
}
