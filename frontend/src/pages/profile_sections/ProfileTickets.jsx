import { useState } from 'react';

export default function ProfileTickets({ reservedTickets, activeTickets, pendingReturnTickets, refundedTickets, expiredTickets, loading, onResell, onAccept, onDecline, events }) {
  
  const [expandedSections, setExpandedSections] = useState({
    reserved: true,
    active: true,
    pending: false,
    refunded: false,
    expired: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to check if event is sold out
  const isEventSoldOut = (eventId) => {
    const event = events?.find(e => e.id === eventId);
    if (!event) return false;
    return event.tickets_sold >= event.total_tickets;
  };

  // Check if user has any tickets eligible for return
  const hasEligibleTickets = activeTickets.some(t => isEventSoldOut(t.event_id));

  return (
    <section className="profile-card profile-tickets">
      <div className="tickets-header">
        <h2>Your Tickets</h2>
        {hasEligibleTickets && !loading && (
          <div className="tickets-notice">
            <strong>Can't attend the event?</strong>
            <div className="tickets-notice-hint">
              You can return eligible tickets below for sold-out events
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* RESERVED TICKETS (FROM WAITLIST) */}
          {reservedTickets && reservedTickets.length > 0 && (
            <div className="ticket-section">
              <div 
                className="ticket-section-header success"
                onClick={() => toggleSection('reserved')}
              >
                <h3>🎫 Ticket Offers (from Waitlist) <span className="count-badge">{reservedTickets.length}</span></h3>
                <span className="accordion-icon">{expandedSections.reserved ? '▼' : '▶'}</span>
              </div>
              {expandedSections.reserved && (
                <div className="ticket-section-content">
                  {reservedTickets.map(t => (
                    <div key={t.id} className="ticket-item reserved">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TICKETS */}
          <div className="ticket-section">
            <div 
              className="ticket-section-header"
              onClick={() => toggleSection('active')}
            >
              <h3>Active Tickets <span className="count-badge">{activeTickets.length}</span></h3>
              <span className="accordion-icon">{expandedSections.active ? '▼' : '▶'}</span>
            </div>
            {expandedSections.active && (
              <div className="ticket-section-content">
                {activeTickets.length === 0 ? (
                  <p>No active tickets.</p>
                ) : (
                  activeTickets.map(t => {
                    const soldOut = isEventSoldOut(t.event_id);
                    return (
                      <div key={t.id} className="ticket-item">
                        <div className="ticket-info">
                          <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                          <div className="ticket-meta">
                            Event: {new Date(t.start_datetime).toLocaleString()}
                            {soldOut && <span className="sold-out-indicator">● Sold Out</span>}
                          </div>
                          {!soldOut && (
                            <div className="ticket-return-hint">
                              Tickets can only be returned for sold out events
                            </div>
                          )}
                        </div>
                        {soldOut && (
                          <button
                            className="ticket-return-btn"
                            onClick={() => onResell(t.id, t.event_id)}
                            title="Return ticket to waitlist - you'll be refunded 98% of ticket price when someone accepts it (2% platform fee)"
                          >
                            Return Ticket
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* PENDING RETURN TICKETS */}
          {pendingReturnTickets && pendingReturnTickets.length > 0 && (
            <div className="ticket-section">
              <div 
                className="ticket-section-header warning"
                onClick={() => toggleSection('pending')}
              >
                <h3>Pending Return <span className="count-badge">{pendingReturnTickets.length}</span></h3>
                <span className="accordion-icon">{expandedSections.pending ? '▼' : '▶'}</span>
              </div>
              {expandedSections.pending && (
                <div className="ticket-section-content">
                  {pendingReturnTickets.map(t => (
                    <div key={t.id} className="ticket-item pending-return">
                      <div className="ticket-info">
                        <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                        <div className="ticket-meta">
                          Event: {new Date(t.start_datetime).toLocaleString()}
                        </div>
                        <div className="ticket-status-box pending">
                          <strong>Return Requested</strong>
                          <span className="status-text">
                            Your ticket is being offered to the people on the waitlist. Your ticket is valid until someone else accepts it. If your ticket is sold, you will receive 98% of the ticket price (2% platform fee).
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REFUNDED TICKETS */}
          {refundedTickets && refundedTickets.length > 0 && (
            <div className="ticket-section">
              <div 
                className="ticket-section-header success"
                onClick={() => toggleSection('refunded')}
              >
                <h3>Successfully Refunded <span className="count-badge">{refundedTickets.length}</span></h3>
                <span className="accordion-icon">{expandedSections.refunded ? '▼' : '▶'}</span>
              </div>
              {expandedSections.refunded && (
                <div className="ticket-section-content">
                  {refundedTickets.map(t => (
                    <div key={t.id} className="ticket-item refunded">
                      <div className="ticket-info">
                        <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                        <div className="ticket-meta">
                          Event: {new Date(t.start_datetime).toLocaleString()}
                        </div>
                        <div className="ticket-status-box success">
                          <strong>Return Completed</strong>
                          <span className="status-text">
                            Your ticket was successfully sold and you have been refunded (2% platform fee applied).
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPIRED TICKETS */}
          <div className="ticket-section">
            <div 
              className="ticket-section-header"
              onClick={() => toggleSection('expired')}
            >
              <h3>Expired Tickets <span className="count-badge">{expiredTickets.length}</span></h3>
              <span className="accordion-icon">{expandedSections.expired ? '▼' : '▶'}</span>
            </div>
            {expandedSections.expired && (
              <div className="ticket-section-content">
                {expiredTickets.length === 0 ? (
                  <p>No expired tickets.</p>
                ) : (
                  expiredTickets.map(t => (
                    <div key={t.id} className="ticket-item expired">
                      <div><strong>{t.event_name}</strong></div>
                      <div className="ticket-meta">
                        Event ended: {new Date(t.end_datetime).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
