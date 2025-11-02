import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>All Events</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <Link to={`/events/${e.id}`}>
                {e.title} – {new Date(e.start_datetime).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
