export default function ProfileTickets({ activeTickets, expiredTickets, loading }) {
  return (
    <section className="profile-card profile-tickets">
      <h2>Your Tickets</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Active Tickets</h3>
          <ul className="ticket-list">
            {activeTickets.map(t => (
              <li key={t.id} className="ticket-item">
                <div><strong>{t.event_name}</strong> – {t.ticket_type} (${t.ticket_price})</div>
                <div className="ticket-meta">Event: {new Date(t.start_datetime).toLocaleString()}</div>
              </li>
            ))}
            {activeTickets.length === 0 && <p>No active tickets.</p>}
          </ul>

          <h3>Expired Tickets</h3>
          <ul className="ticket-list">
            {expiredTickets.map(t => (
              <li key={t.id} className="ticket-item" style={{ opacity: 0.6 }}>
                <div><strong>{t.event_name}</strong></div>
                <div className="ticket-meta">Event ended: {new Date(t.end_datetime).toLocaleString()}</div>
              </li>
            ))}
            {expiredTickets.length === 0 && <p>No expired tickets.</p>}
          </ul>
        </>
      )}
    </section>
  );
}
