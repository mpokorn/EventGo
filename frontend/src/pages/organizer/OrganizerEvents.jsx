import { useEffect, useState } from "react";
import "../../styles/organizer.css";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // TODO: Replace with API
    setEvents([
      { id: 1, title: "Tech Conference", location: "Berlin" },
      { id: 2, title: "Music Festival", location: "London" },
    ]);
  }, []);

  return (
    <div className="organizer-page">
      <h1 className="organizer-title">My Events</h1>

      <div>
        {events.map((event) => (
          <div key={event.id} className="organizer-event-card">
            <h3>{event.title}</h3>
            <p>{event.location}</p>

            <div className="event-actions">
              <button>Edit</button>
              <button>View Tickets</button>
              <button>Delete</button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p>No events listed yet.</p>
        )}
      </div>
    </div>
  );
}
