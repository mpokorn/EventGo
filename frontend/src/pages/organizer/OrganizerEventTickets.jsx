import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import OrganizerLayout from "../../components/OrganizerLayout";
import { ticketService } from "../../api/ticketService";
import { transactionService } from "../../api/transactionService";
import { TicketListSkeleton } from "../../components/SkeletonLoaders";

import "../../styles/organizer.css";
import "../../styles/profile.css";

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
        <Link to="/organizer/events" className="org-btn ghost" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
          ← Back to Events
        </Link>

        <h1 className="organizer-title">Tickets Sold</h1>

        {error && <p className="org-error">{error}</p>}

        {loading ? (
          <>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: 'var(--space-xl)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Active Tickets
            </h3>
            <TicketListSkeleton count={4} />
          </>
        ) : !error && (
          <>
            {/* ACTIVE TICKETS */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Active Tickets ({activeTickets.length})
              </h3>
              
              {activeTickets.length === 0 ? (
                <p className="org-muted">No active tickets.</p>
              ) : (
                <ul className="ticket-list">
                  {activeTickets.map((t) => {
                    const transaction = transactionMap[t.transaction_id];

                    return (
                      <li key={t.id} className="ticket-item">
                        <div className="ticket-info">
                          <strong>{t.ticket_type}</strong> – €{t.ticket_price}
                          <div className="ticket-meta">
                            <div><strong>Ticket ID:</strong> {t.id}</div>
                            <div><strong>Status:</strong> {t.status}</div>
                            <div><strong>Buyer:</strong> {t.buyer_name} (User ID: {t.user_id})</div>
                            <div><strong>Issued At:</strong> {new Date(t.issued_at).toLocaleString()}</div>
                            {transaction && (
                              <>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                                  <strong>Transaction Details:</strong>
                                </div>
                                <div><strong>Transaction ID:</strong> #{transaction.id}</div>
                                <div><strong>Total Price:</strong> €{transaction.total_price}</div>
                                <div><strong>Payment Method:</strong> {transaction.payment_method}</div>
                                <div><strong>Transaction Status:</strong> {transaction.status}</div>
                                <div><strong>Reference Code:</strong> {transaction.reference_code || 'N/A'}</div>
                                <div><strong>Created At:</strong> {new Date(transaction.created_at).toLocaleString()}</div>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          className="ticket-return-btn"
                          onClick={() => refundTicket(t.id)}
                        >
                          Refund Ticket
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* REFUNDED TICKETS */}
            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Refunded Tickets ({refundedTickets.length})
              </h3>
              
              {refundedTickets.length === 0 ? (
                <p className="org-muted">No refunded tickets.</p>
              ) : (
                <ul className="ticket-list">
                  {refundedTickets.map((t) => {
                    const transaction = transactionMap[t.transaction_id];

                    return (
                      <li key={t.id} className="ticket-item" style={{ opacity: 0.7 }}>
                        <div className="ticket-info">
                          <strong>{t.ticket_type}</strong> – €{t.ticket_price}
                          <div className="ticket-meta">
                            <div><strong>Ticket ID:</strong> {t.id}</div>
                            <div><strong>Status:</strong> <span style={{ color: 'var(--color-error)' }}>refunded</span></div>
                            <div><strong>Buyer:</strong> {t.buyer_name} (User ID: {t.user_id})</div>
                            <div><strong>Issued At:</strong> {new Date(t.issued_at).toLocaleString()}</div>
                            {transaction && (
                              <>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                                  <strong>Transaction Details:</strong>
                                </div>
                                <div><strong>Transaction ID:</strong> #{transaction.id}</div>
                                <div><strong>Total Price:</strong> €{transaction.total_price}</div>
                                <div><strong>Payment Method:</strong> {transaction.payment_method}</div>
                                <div><strong>Transaction Status:</strong> {transaction.status}</div>
                                <div><strong>Reference Code:</strong> {transaction.reference_code || 'N/A'}</div>
                                <div><strong>Created At:</strong> {new Date(transaction.created_at).toLocaleString()}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </OrganizerLayout>
  );
}
