import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import api from "../api/api";
import { Clock, CheckCircle, MapPin, Ticket, User, Info } from "lucide-react";
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
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setMessage(err.response?.data?.message || "Failed to load event");
        setMessageType("error");
        setLoading(false);
      });
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
    // Check if user is authenticated
    if (!requireAuth()) {
      return;
    }

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
        
        // Check if user is authenticated
        if (!requireAuth()) {
          return;
        }

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
      }
    });
  }

  if (loading) return <div className="loading-message">Loading event...</div>;
  if (message && messageType === "error" && !event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-message error">{message}</div>
      </div>
    );
  }
  if (!event) return <div className="loading-message">Event not found</div>;

  // Check if event has passed - use backend calculation
  const isPastEvent = event.is_past;

  // Check if ALL ticket types are sold out
  const allTicketTypesSoldOut = event.ticket_types?.length > 0 
    ? event.ticket_types.every(t => t.tickets_sold >= t.total_tickets)
    : event.tickets_sold >= event.total_tickets;
  
  const isSoldOut = allTicketTypesSoldOut;

  return (
    <div className="event-detail-page">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate(-1)}>
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
            <p>
              <Clock size={20} />
              <span>Start:</span> {new Date(event.start_datetime).toLocaleString("sl-SI")}
            </p>
            <p>
              <CheckCircle size={20} />
              <span>End:</span> {new Date(event.end_datetime || event.start_datetime).toLocaleString("sl-SI")}
            </p>
            <p>
              <MapPin size={20} />
              <span>Location:</span> {event.location}
            </p>
            <p>
              <User size={20} />
              <span>Organizer:</span> {event.organizer_name || `Organizer #${event.organizer_id}`}
            </p>
          </div>
        </div>

        {/* ABOUT EVENT */}
        <div className="event-detail-card event-detail-info-card">
          <h3>About Event</h3>
          <p className="event-about-description">{event.description}</p>
        </div>

        {/* TICKET INFO */}
        <div className="event-detail-card event-detail-info-card">
          <h3>Ticket Information</h3>
          <div className="event-detail-info-list">
            <p>
              <Ticket size={20} />
              <span>Tickets Sold:</span> {event.tickets_sold}/{event.total_tickets}
            </p>
          </div>
        </div>

        {/* TICKET OR WAITLIST CARD */}
        <div className="event-detail-card event-detail-ticket-card">

          {/* If event has passed */}
          {isPastEvent ? (
            <div className="past-event-notice">
              <p className="event-detail-no-tickets">This event has ended.</p>
              <p className="event-detail-subtitle">Tickets are no longer available for purchase.</p>
            </div>
          ) : !isSoldOut ? (
            // Event is upcoming and not sold out → show purchase form
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
                step="1"
                max="10"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0 && val <= 10) {
                    setQuantity(val);
                  } else if (e.target.value === "") {
                    setQuantity(1);
                  }
                }}
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
