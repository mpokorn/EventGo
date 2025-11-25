export default function ProfileWaitlist({ waitlist, loading }) {
  return (
    <section className="profile-card profile-waitlist">
      <h2>Your Waitlist</h2>

      {loading ? (
        <p>Loading...</p>
      ) : waitlist.length === 0 ? (
        <p>You are not on any waitlists.</p>
      ) : (
        <ul className="event-list">
          {waitlist.map(w => (
            <li key={w.id} className="event-item">
              <div>
                <strong>{w.event_name}</strong>
                <div className="event-dates">
                  Starts: {new Date(w.start_datetime).toLocaleString()}
                </div>
                <div className="waitlist-position">
                  Position: #{w.position} in line
                </div>
              </div>
              <div className="event-actions">
                <a href={`/events/${w.event_id}`}>View Event</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
