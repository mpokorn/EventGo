import { useEffect, useState } from "react";
import OrganizerLayout from "../../components/OrganizerLayout";
import "../../styles/organizer.css";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // TODO: load from API
    setEvents([
      { id: 1, title: "Tech Expo 2025", location: "Berlin" },
      { id: 2, title: "Music Festival", location: "London" }
    ]);
  }, []);

  return (
    <OrganizerLayout>
      <h1 className="organizer-title">My Events</h1>

      {events.map((ev) => (
        <div key={ev.id} className="organizer-event-card">
          <h3>{ev.title}</h3>
          <p>{ev.location}</p>

          <div className="event-actions">
            <button>Edit</button>
            <button>Tickets</button>
            <button>Delete</button>
          </div>
        </div>
      ))}
    </OrganizerLayout>
  );
}
