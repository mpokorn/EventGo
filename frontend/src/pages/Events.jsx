import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import { EventsGridSkeleton } from "../components/SkeletonLoaders";
import "../styles/events.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState(null);
  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      
      //console.log('Fetching events with params:', params.toString());
      const res = await api.get(`/events?${params.toString()}`);
      //console.log('Backend response:', res.data);
      
      const now = new Date();
      const eventsData = res.data.events || res.data || [];
      //console.log('Events from backend:', eventsData.length);
      
      const upcoming = eventsData.filter((e) => {
        const end = e?.end_datetime ? new Date(e.end_datetime) : null;
        const start = e?.start_datetime ? new Date(e.start_datetime) : null;
        if (end instanceof Date && !isNaN(end)) return end > now;
        if (start instanceof Date && !isNaN(start)) return start > now;
        return true;
      });
      
      //console.log('Upcoming events after filter:', upcoming.length);
      setEvents(upcoming);
      
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("API error:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchParams]);
  
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Upcoming Events</h1>
        <p className="events-subtitle">Discover and join events happening near you.</p>
      </div>

      {loading ? (
        <EventsGridSkeleton count={6} />
      ) : events.length === 0 ? (
        <p className="no-events">No events found matching your criteria.</p>
      ) : (
        <>
          <div className="events-grid">
            {events.map((e) => {
              const isSoldOut = e.tickets_sold >= e.total_tickets;
              
              return (
                <div className="event-card" key={e.id}>
                  {isSoldOut && <div className="sold-out-badge">SOLD OUT</div>}
                  <div className="event-card-content">
                    <h2 className="event-title">{e.title}</h2>
                    <p className="event-description">
                      {e.description?.substring(0, 100)}...
                    </p>

                    <div className="event-info">
                      <p>
                        <span>Date:</span> {new Date(e.start_datetime).toLocaleString("sl-SI")}
                      </p>
                      <p>
                        <span>Location:</span> {e.location}
                      </p>
                      <p>
                        <span>Tickets:</span> {e.tickets_sold}/{e.total_tickets}
                      </p>
                    </div>

                    <Link to={`/events/${e.id}`} className={`event-btn ${isSoldOut ? 'sold-out' : ''}`}>
                      {isSoldOut ? 'Join Waitlist' : 'Buy Tickets'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
