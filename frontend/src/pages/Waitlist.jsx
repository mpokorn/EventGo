import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "../styles/profile.css";

export default function WaitlistPage() {
  const { user } = useAuth();
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWaitlist = async () => {
      try {
        const res = await api.get(`/waitlist/user/${user.id}`);
        setWaitlist(res.data.waitlist || []);
      } catch (err) {
        console.error("Failed to load waitlist", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadWaitlist();
  }, [user]);

  if (!user) return <p>Please log in.</p>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Your Full Waitlist</h2>

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
                  <div className="event-dates" style={{ opacity: 0.7 }}>
                    Joined waitlist: {new Date(w.joined_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="event-actions">
                  <a href={`/events/${w.event_id}`}>View</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
