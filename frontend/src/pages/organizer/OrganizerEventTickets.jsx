import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import OrganizerLayout from "../../components/OrganizerLayout";
import { ticketService } from "../../api/ticketService";
import { transactionService } from "../../api/transactionService";

import "../../styles/organizer.css";

export default function OrganizerEventTickets() {
  const { id } = useParams(); // event_id
  const [tickets, setTickets] = useState([]);
  const [transactionMap, setTransactionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all tickets for this event
  const loadTickets = async () => {
    try {
      const res = await ticketService.getByEvent(id);

      const array = Array.isArray(res.data.tickets)
        ? res.data.tickets
        : [];

      setTickets(array);

      // Collect unique transaction IDs
      const transactionIds = [
        ...new Set(array.map((t) => t.transaction_id).filter(Boolean)),
      ];

      if (transactionIds.length > 0) {
        const responses = await Promise.all(
          transactionIds.map((tid) => transactionService.getOne(tid))
        );

        const map = {};
        responses.forEach((r) => {
          map[r.data.id] = r.data;
        });

        setTransactionMap(map);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [id]);

  // Refund ticket
  const refundTicket = async (ticketId) => {
    if (!window.confirm("Refund this ticket?")) return;

    try {
      await ticketService.refund(ticketId);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: "refunded" } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Refund failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Helpers
  const activeTickets = tickets.filter((t) => t.status === "active");
  const refundedTickets = tickets.filter((t) => t.status === "refunded");

  return (
    <OrganizerLayout title="Tickets Sold">
      <div className="org-events-container">
        <h1 className="organizer-title">Tickets Sold</h1>

        {loading && <p className="org-muted">Loading tickets...</p>}
        {error && <p className="org-error">{error}</p>}

        {!loading && tickets.length === 0 && (
          <p className="org-muted">No tickets sold for this event yet.</p>
        )}

        {/* ACTIVE TICKETS */}
        <h2 className="organizer-title" style={{ marginTop: "2rem" }}>
          Active Tickets
        </h2>

        {activeTickets.length === 0 ? (
          <p className="org-muted">No active tickets.</p>
        ) : (
          activeTickets.map((t) => {
            const transaction = transactionMap[t.transaction_id];

            return (
              <div key={t.id} className="org-event-card">
                <div className="org-event-header">
                  <h3>{t.ticket_type}</h3>
                  <p className="org-location">€{t.ticket_price}</p>
                </div>

                <div className="org-event-details">
                  <p><span className="label">Buyer:</span> {t.buyer_name}</p>

                  {transaction && (
                    <>
                      <p><span className="label">Transaction:</span> #{transaction.id}</p>
                      <p><span className="label">Paid:</span> €{transaction.total_price}</p>
                      <p><span className="label">Payment Method:</span> {transaction.payment_method}</p>
                      <p><span className="label">Paid At:</span> {new Date(transaction.created_at).toLocaleString("sl-SI")}</p>
                      <p><span className="label">Reference:</span> {transaction.reference_code || "–"}</p>
                    </>
                  )}
                </div>

                <div className="org-event-actions">
                  <button
                    type="button"
                    className="org-btn small danger"
                    onClick={() => refundTicket(t.id)}
                  >
                    Refund
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* REFUNDED TICKETS */}
        <h2 className="organizer-title" style={{ marginTop: "2rem" }}>
          Refunded Tickets
        </h2>

        {refundedTickets.length === 0 ? (
          <p className="org-muted">No refunded tickets.</p>
        ) : (
          refundedTickets.map((t) => {
            const transaction = transactionMap[t.transaction_id];

            return (
              <div key={t.id} className="org-event-card">
                <div className="org-event-header">
                  <h3>{t.ticket_type}</h3>
                  <p className="org-location">€{t.ticket_price}</p>
                </div>

                <div className="org-event-details">
                  <p><span className="label">Buyer:</span> {t.buyer_name}</p>
                  <p>
                    <span className="label">Status:</span>
                    <span style={{ color: "#f87171" }}> Refunded</span>
                  </p>

                  {transaction && (
                    <>
                      <p><span className="label">Transaction:</span> #{transaction.id}</p>
                      <p><span className="label">Paid:</span> €{transaction.total_price}</p>
                      <p><span className="label">Payment Method:</span> {transaction.payment_method}</p>
                      <p><span className="label">Paid At:</span> {new Date(transaction.created_at).toLocaleString("sl-SI")}</p>
                      <p><span className="label">Reference:</span> {transaction.reference_code || "–"}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </OrganizerLayout>
  );
}
