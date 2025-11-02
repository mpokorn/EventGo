import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error("API error:", err));
  }, [id]);

  async function handlePurchase() {
    if (!ticketType) return setMessage("⚠️ Please select a ticket type.");

    try {
      setLoading(true);
      setMessage("");

      const user_id = 1; // 🔧 replace with logged-in user ID later
      const response = await api.post("/tickets", {
        user_id,
        event_id: event.id,
        ticket_type_id: parseInt(ticketType),
        quantity,
        payment_method: "card",
      });

      setMessage(`✅ ${response.data.message}`);
    } catch (err) {
      console.error("Purchase error:", err);
      setMessage(`❌ ${err.response?.data?.message || "Purchase failed."}`);
    } finally {
      setLoading(false);
    }
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>When:</strong> {new Date(event.start_datetime).toLocaleString()}</p>
      <p><strong>Where:</strong> {event.location}</p>

      <h3>Buy Tickets</h3>
      {event.ticket_types?.length ? (
        <div style={{ marginBottom: "1rem" }}>
          <label>Ticket type: </label>
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {event.ticket_types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.type} – {t.price} €
              </option>
            ))}
          </select>

          <br />
          <label>Quantity: </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ width: "60px", marginLeft: "0.5rem" }}
          />

          <br /><br />
          <button
            onClick={handlePurchase}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#222",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Processing..." : "Buy Ticket"}
          </button>
        </div>
      ) : (
        <p>No ticket types available.</p>
      )}

      {message && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}
