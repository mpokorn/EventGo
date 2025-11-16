import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "../styles/event_details.css";

export default function EventDetail() {
  const { id } = useParams();
  const { requireAuth } = useAuth();

  const [event, setEvent] = useState(null);
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error("API error:", err));
  }, [id]);

  async function handlePurchase() {
    if (!ticketType) {
      setMessage("Please select a ticket type.");
      setMessageType("error");
      return;
    }

    const purchase = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.post("/tickets", {
          event_id: event.id,
          ticket_type_id: parseInt(ticketType),
          quantity: parseInt(quantity),
          payment_method: "card",
        });

        setMessage(response.data.message);
        setMessageType("success");

        // refresh event
        const updated = await api.get(`/events/${id}`);
        setEvent(updated.data);

      } catch (err) {
        setMessage(err.response?.data?.message || "Error purchasing tickets.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    requireAuth(purchase);
  }

  if (!event) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div className="event-detail-page">

      {/* HEADER */}
      <div className="event-detail-header">
        <h1>{event.title}</h1>
        <p className="event-detail-subtitle">{event.description}</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="event-detail-main">

        {/* EVENT INFO CARD */}
        <div className="event-detail-card event-detail-info-card">
          <h3>Event Details</h3>

          <div className="event-detail-info-list">
            <p><span>Date:</span> {new Date(event.start_datetime).toLocaleString("sl-SI")}</p>
            <p><span>Location:</span> {event.location}</p>
            <p><span>Tickets Sold:</span> {event.tickets_sold}/{event.total_tickets}</p>
          </div>
        </div>

        {/* TICKET PURCHASE CARD */}
        <div className="event-detail-card event-detail-ticket-card">

          {event.ticket_types?.length ? (
            <>
            {/* Ticket Type */}
            <label className="event-detail-label">Ticket Type</label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="event-detail-select"   
            >
              <option value="">Choose a ticket...</option>
              {event.ticket_types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type} – {t.price} €
                </option>
              ))}
            </select>


              {/* Quantity */}
              <label className="event-detail-label">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="event-detail-input event-detail-input-small"  
              />  

              <button
                onClick={handlePurchase}
                disabled={loading}
                className="event-detail-btn"
              >
                {loading ? "Processing..." : "Buy Tickets"}
              </button>
            </>
          ) : (
            <p className="event-detail-no-tickets">No tickets available.</p>
          )}

        </div>
      </div>

      {message && (
        <div className={`event-detail-message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}
