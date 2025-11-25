import { Link } from "react-router-dom";

export default function ProfileEvents({ events = [], loading }) {
  return (
    <section className="profile-card profile-events">
      <h2>Your Events</h2>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul className="event-list">
          {events.map(e => (
            <li key={e.id} className="event-item">
              <div>
                <strong>{e.title}</strong>
                <div className="event-dates">
                  {new Date(e.start_datetime).toLocaleString()}
                </div>
              </div>
              <div className="event-actions">
                <Link to={`/profile/event/${e.id}`}>View tickets</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
