import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import api from "../api/api";
import "../styles/event_details.css";

export default function EventDetail() {
  const { id } = useParams();
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // WAITLIST STATE
  const [joined, setJoined] = useState(false);

  // MODAL STATE
  const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", onConfirm: null });

  // Load event data
  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => {

        setEvent(res.data);
      })
      .catch((err) => console.error("API error:", err));
  }, [id]);

  // Purchase tickets
  async function handlePurchase() {
    if (!ticketType) {
      setMessage("Please select a ticket type.");
      setMessageType("error");
      return;
    }

    // Check if selected ticket type has available tickets
    const selectedType = event.ticket_types?.find(t => t.id === parseInt(ticketType));
    if (selectedType) {
      const available = selectedType.total_tickets - selectedType.tickets_sold;
      if (available < quantity) {
        setMessage(`Only ${available} ticket(s) available for this type.`);
        setMessageType("error");
        return;
      }
    }

    const selectedTicketType = event.ticket_types?.find(t => t.id === parseInt(ticketType));
    const totalPrice = selectedTicketType ? selectedTicketType.price * quantity : 0;

    setModal({
      isOpen: true,
      type: "confirm",
      title: "Confirm Purchase",
      message: `Are you sure you want to purchase ${quantity} ${selectedTicketType?.type} ticket(s) for €${totalPrice.toFixed(2)}?`,
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        await executePurchase();
      }
    });
  }

  // Execute the actual purchase
  async function executePurchase() {
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

        // refresh event data (tickets sold changes)
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

  // WAITLIST JOIN FUNCTION
  async function joinWaitlist() {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Join Waitlist",
      message: "Are you sure you want to join the waitlist? You'll be notified if a ticket becomes available.",
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        requireAuth(async () => {
          try {
            const res = await api.post("/waitlist", {
              user_id: user.id,
              event_id: event.id,
            });

            setJoined(true);
            const position = res.data.position;
            setModal({
              isOpen: true,
              type: "alert",
              title: "Success",
              message: `You've been added to the waitlist! You are #${position} in line.`,
              onConfirm: null
            });
          } catch (err) {
            setModal({
              isOpen: true,
              type: "alert",
              title: "Error",
              message: err.response?.data?.message || "Error joining waitlist.",
              onConfirm: null
            });
          }
        });
      }
    });
  }

  if (!event) return <p style={{ color: "white" }}>Loading...</p>;

  // Check if ALL ticket types are sold out
  const allTicketTypesSoldOut = event.ticket_types?.length > 0 
    ? event.ticket_types.every(t => {
        const soldOut = t.tickets_sold >= t.total_tickets;
        //console.log(`🔍 Checking ${t.type}: ${t.tickets_sold}/${t.total_tickets} = ${soldOut ? 'SOLD OUT' : 'AVAILABLE'}`);
        return soldOut;
      })
    : event.tickets_sold >= event.total_tickets;
  
  //console.log('🎪 Is event sold out?', allTicketTypesSoldOut);
  const isSoldOut = allTicketTypesSoldOut;

  return (
    <div className="event-detail-page">

      {/* BACK BUTTON */}
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        ← Back
      </button>

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

        {/* TICKET OR WAITLIST CARD */}
        <div className="event-detail-card event-detail-ticket-card">

          {/* If the event is not sold out → show purchase form */}
          {!isSoldOut ? (
            <>
              {/* Ticket Type */}
              <label className="event-detail-label">Ticket Type</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="event-detail-select"
              >
                <option value="">Choose a ticket...</option>
                {event.ticket_types?.map((t) => {
                  const available = t.total_tickets - t.tickets_sold;
                  const soldOut = available <= 0;
                  return (
                    <option key={t.id} value={t.id} disabled={soldOut}>
                      {t.type} – {t.price} € {soldOut ? '(Sold Out)' : `(${available} available)`}
                    </option>
                  );
                })}
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
            // SOLD OUT → WAITLIST MODE
            <div className="waitlist-container">
              <p className="event-detail-no-tickets">The event is sold out.</p>

              {!joined ? (
                <button
                  onClick={joinWaitlist}
                  className="event-detail-btn"
                >
                  Join Waitlist Here
                </button>
              ) : (
                <p className="event-detail-success">
                  ✔ You have been added to the waitlist!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGE BOX */}
      {message && (
        <div className={`event-detail-message ${messageType}`}>
          {message}
        </div>
      )}

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
