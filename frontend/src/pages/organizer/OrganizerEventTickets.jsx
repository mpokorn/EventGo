import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import OrganizerLayout from "../../components/OrganizerLayout";
import Modal from "../../components/Modal";
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
  const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", onConfirm: null });

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

  // Refund ticket (organizer action - can refund anytime)
  const refundTicket = async (ticketId) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Refund Ticket",
      message: "Are you sure you want to refund this ticket? The ticket will be made available for purchase again (or offered to waitlist if sold out).",
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        try {
          const response = await ticketService.organizerRefund(ticketId);
          
          // Reload tickets to show updated status and counts
          await loadTickets();
          
          // Show success message
          setModal({
            isOpen: true,
            type: "alert",
            title: "Success",
            message: response.data.message,
            onConfirm: () => setModal({ ...modal, isOpen: false })
          });
        } catch (err) {
          console.error(err);
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: "Refund failed: " + (err.response?.data?.message || err.message),
            onConfirm: () => setModal({ ...modal, isOpen: false })
          });
        }
      }
    });
  };

  // Helpers - categorize tickets by status
  const activeTickets = tickets.filter((t) => t.status === "active");
  const reservedTickets = tickets.filter((t) => t.status === "reserved");
  const pendingReturnTickets = tickets.filter((t) => t.status === "pending_return");
  const refundedTickets = tickets.filter((t) => t.status === "refunded");

  return (
    <OrganizerLayout title="Tickets Sold">
      <div className="org-events-container">
        <Link to="/organizer/events" className="org-back-btn">
          ← Back to Events
        </Link>

        <h1 className="organizer-title">Tickets Sold</h1>

        {error && <p className="org-error">{error}</p>}

        {loading ? (
          <>
            <h3 className="org-section-title muted spaced">
              Active Tickets
            </h3>
            <TicketListSkeleton count={4} />
          </>
        ) : !error && (
          <>
            {/* SUMMARY STATS */}
            <div className="org-stats-grid">
              <div className="org-stat-card">
                <div className="org-stat-label">Active</div>
                <div className="org-stat-value success">{activeTickets.length}</div>
              </div>
              <div className="org-stat-card">
                <div className="org-stat-label">Reserved (Waitlist)</div>
                <div className="org-stat-value info">{reservedTickets.length}</div>
              </div>
              <div className="org-stat-card">
                <div className="org-stat-label">Pending Return</div>
                <div className="org-stat-value warning">{pendingReturnTickets.length}</div>
              </div>
              <div className="org-stat-card">
                <div className="org-stat-label">Refunded</div>
                <div className="org-stat-value danger">{refundedTickets.length}</div>
              </div>
            </div>

            {/* RESERVED TICKETS (FROM WAITLIST) */}
            {reservedTickets.length > 0 && (
              <div className="org-section">
                <h3 className="org-section-title info">
                  🎫 Reserved Tickets - Awaiting Acceptance ({reservedTickets.length})
                </h3>
                <p className="org-section-subtitle">
                  These tickets are offered to waitlist users and pending their acceptance.
                </p>
                <ul className="ticket-list">
                  {reservedTickets.map((t) => {
                    const transaction = transactionMap[t.transaction_id];
                    return (
                      <li key={t.id} className="ticket-item reserved">
                        <div className="ticket-info">
                          <strong>{t.ticket_type}</strong> – €{t.ticket_price}
                          <div className="org-badge reserved">
                            RESERVED
                          </div>
                          <div className="ticket-meta">
                            <div><strong>Ticket ID:</strong> {t.id}</div>
                            <div><strong>Status:</strong> <span className="status-reserved">reserved (waitlist offer)</span></div>
                            <div><strong>Offered To:</strong> {t.buyer_name} (User ID: {t.user_id})</div>
                            <div><strong>Issued At:</strong> {new Date(t.issued_at).toLocaleString()}</div>
                            {transaction && (
                              <>
                                <div className="ticket-divider">
                                  <strong>Transaction Details:</strong>
                                </div>
                                <div><strong>Transaction ID:</strong> #{transaction.id}</div>
                                <div><strong>Total Price:</strong> €{transaction.total_price}</div>
                                <div><strong>Payment Method:</strong> {transaction.payment_method}</div>
                                <div><strong>Transaction Status:</strong> <span className="status-warning">{transaction.status}</span></div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* ACTIVE TICKETS */}
            <div className="org-section">
              <h3 className="org-section-title muted">
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
                                <div className="ticket-divider">
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

            {/* PENDING RETURN TICKETS */}
            {pendingReturnTickets.length > 0 && (
              <div className="org-section large">
                <h3 className="org-section-title warning">
                   Pending Return ({pendingReturnTickets.length})
                </h3>
                <p className="org-section-subtitle">
                  These tickets have been requested for return and are being offered to the waitlist.
                </p>
                <ul className="ticket-list">
                  {pendingReturnTickets.map((t) => {
                    const transaction = transactionMap[t.transaction_id];
                    return (
                      <li key={t.id} className="ticket-item pending">
                        <div className="ticket-info">
                          <strong>{t.ticket_type}</strong> – €{t.ticket_price}
                          <div className="ticket-meta">
                            <div><strong>Ticket ID:</strong> {t.id}</div>
                            <div><strong>Status:</strong> <span className="status-pending">Pending return</span></div>
                            <div><strong>Original Buyer:</strong> {t.buyer_name} (User ID: {t.user_id})</div>
                            <div><strong>Issued At:</strong> {new Date(t.issued_at).toLocaleString()}</div>
                            {transaction && (
                              <>
                                <div className="ticket-divider">
                                  <strong>Transaction Details:</strong>
                                </div>
                                <div><strong>Transaction ID:</strong> #{transaction.id}</div>
                                <div><strong>Total Price:</strong> €{transaction.total_price}</div>
                                <div><strong>Payment Method:</strong> {transaction.payment_method}</div>
                                <div><strong>Transaction Status:</strong> {transaction.status}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* REFUNDED TICKETS */}
            <div className="org-section large">
              <h3 className="org-section-title muted">
                Refunded Tickets ({refundedTickets.length})
              </h3>
              
              {refundedTickets.length === 0 ? (
                <p className="org-muted">No refunded tickets.</p>
              ) : (
                <ul className="ticket-list">
                  {refundedTickets.map((t) => {
                    const transaction = transactionMap[t.transaction_id];

                    return (
                      <li key={t.id} className="ticket-item muted">
                        <div className="ticket-info">
                          <strong>{t.ticket_type}</strong> – €{t.ticket_price}
                          <div className="ticket-meta">
                            <div><strong>Ticket ID:</strong> {t.id}</div>
                            <div><strong>Status:</strong> <span className="status-error">refunded</span></div>
                            <div><strong>Buyer:</strong> {t.buyer_name} (User ID: {t.user_id})</div>
                            <div><strong>Issued At:</strong> {new Date(t.issued_at).toLocaleString()}</div>
                            {transaction && (
                              <>
                                <div className="ticket-divider">
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

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </OrganizerLayout>
  );
}
