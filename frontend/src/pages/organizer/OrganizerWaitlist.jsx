import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import OrganizerLayout from "../../components/OrganizerLayout";
import api from "../../api/api";

import "../../styles/organizer.css";

export default function OrganizerWaitlist() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventRes, waitlistRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/waitlist/event/${id}`)
        ]);

        setEvent(eventRes.data);
        setWaitlist(waitlistRes.data.waitlist || []);
      } catch (err) {
        console.error("Error loading waitlist:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleRemoveFromWaitlist = async (waitlistId) => {
    if (!window.confirm("Remove this person from the waitlist?")) return;

    try {
      await api.delete(`/waitlist/${waitlistId}`);
      setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
      alert("Removed from waitlist successfully!");
    } catch (err) {
      console.error("Error removing from waitlist:", err);
      alert(err.response?.data?.message || "Failed to remove from waitlist");
    }
  };

  return (
    <OrganizerLayout title={event ? `Waitlist - ${event.title}` : "Waitlist"}>
      <div className="org-events-container">
        
        {/* Back Button */}
        <Link to="/organizer/events" className="org-btn ghost" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
          ← Back to Events
        </Link>

        {loading ? (
          <p className="org-muted">Loading waitlist...</p>
        ) : (
          <>
            {/* Event Info Card */}
            {event && (
              <div className="org-event-card" style={{ marginBottom: '1.5rem' }}>
                <div className="org-event-header">
                  <h3>{event.title}</h3>
                  <p className="org-location">{event.location}</p>
                </div>
                <div className="org-event-details">
                  <p>
                    <span className="label">Tickets Sold:</span> {event.tickets_sold}/{event.total_tickets}
                  </p>
                  <p>
                    <span className="label">People on the Waitlist:</span> {waitlist.length}
                  </p>
                </div>
              </div>
            )}

            {/* Waitlist Table */}
            <div className="org-event-card">
              <h3 style={{ marginBottom: '1rem' }}>Waitlist</h3>
              
              {waitlist.length === 0 ? (
                <p className="org-muted">No one is currently on the waitlist.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="org-table">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map((w, index) => (
                        <tr key={w.id}>
                          <td>#{index + 1}</td>
                          <td>{w.user_name}</td>
                          <td>{w.email}</td>
                          <td>{new Date(w.joined_at).toLocaleString('sl-SI')}</td>
                          <td>
                            <button
                              onClick={() => handleRemoveFromWaitlist(w.id)}
                              className="org-btn small danger"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </OrganizerLayout>
  );
}
