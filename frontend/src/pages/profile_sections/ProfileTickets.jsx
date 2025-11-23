export default function ProfileTickets({ reservedTickets, activeTickets, pendingReturnTickets, refundedTickets, expiredTickets, loading, onResell, onAccept, onDecline }) {
  return (
    <section className="profile-card profile-tickets">
      <h2>Your Tickets</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>

          {/* RESERVED TICKETS (FROM WAITLIST) */}
          {reservedTickets && reservedTickets.length > 0 && (
            <>
              <h3 className="success">🎫 Ticket Offers (from Waitlist)</h3>
              <ul className="ticket-list">
                {reservedTickets.map(t => (
                  <li key={t.id} className="ticket-item reserved">
                    <div className="ticket-info">
                      <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Event: {new Date(t.start_datetime).toLocaleString()}
                      </div>
                      <div className="ticket-offer-badge">
                         You've been offered this ticket from the waitlist!
                      </div>
                    </div>

                    <div className="ticket-actions">
                      <button
                        className="ticket-accept-btn"
                        onClick={() => onAccept(t.transaction_id)}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="ticket-decline-btn"
                        onClick={() => onDecline(t.transaction_id)}
                      >
                        ✗ Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ACTIVE TICKETS */}
          <h3>Active Tickets</h3>
          <ul className="ticket-list">

            {activeTickets.map(t => (
              <li key={t.id} className="ticket-item">

                <div className="ticket-info">
                  <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                  <div className="ticket-meta">
                    Event: {new Date(t.start_datetime).toLocaleString()}
                  </div>
                </div>

                {/* RETURN / RESELL BUTTON */}
                <button
                  className="ticket-return-btn"
                  onClick={() => onResell(t.id, t.event_id)}
                >
                  Return Ticket
                </button>

              </li>
            ))}

            {activeTickets.length === 0 && <p>No active tickets.</p>}
          </ul>

          {/* PENDING RETURN TICKETS */}
          {pendingReturnTickets && pendingReturnTickets.length > 0 && (
            <>
              <h3 className="warning spaced">Pending Return</h3>
              <ul className="ticket-list">
                {pendingReturnTickets.map(t => (
                  <li key={t.id} className="ticket-item pending-return">
                    <div className="ticket-info">
                      <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Event: {new Date(t.start_datetime).toLocaleString()}
                      </div>
                      <div className="ticket-status-box pending">
                        <strong>Return Requested</strong>
                        <span className="status-text">
                          Your ticket is being offered to the people on the waitlist. Your ticket is valid until someone else accepts it.
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* REFUNDED TICKETS */}
          {refundedTickets && refundedTickets.length > 0 && (
            <>
              <h3 className="success spaced">Successfully Refunded</h3>
              <ul className="ticket-list">
                {refundedTickets.map(t => (
                  <li key={t.id} className="ticket-item refunded">
                    <div className="ticket-info">
                      <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Event: {new Date(t.start_datetime).toLocaleString()}
                      </div>
                      <div className="ticket-status-box success">
                        <strong>Return Completed</strong>
                        <span className="status-text">
                          Your ticket was successfully sold and you will be refunded.
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* EXPIRED TICKETS */}
          <h3 className="spaced">Expired Tickets</h3>
          <ul className="ticket-list">

            {expiredTickets.map(t => (
              <li key={t.id} className="ticket-item expired">
                <div><strong>{t.event_name}</strong></div>
                <div className="ticket-meta">
                  Event ended: {new Date(t.end_datetime).toLocaleString()}
                </div>
              </li>
            ))}

            {expiredTickets.length === 0 && <p>No expired tickets.</p>}
          </ul>

        </>
      )}
    </section>
  );
}
