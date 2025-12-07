import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { EventsGridSkeleton } from "../components/SkeletonLoaders";
import "../styles/events.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const currentPage = parseInt(searchParams.get("page") || "1");
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      params.set("filter", filter); // Add filter parameter
      
      const res = await api.get(`/events?${params.toString()}`);
      const eventsData = res.data.events || res.data || [];
      
      setEvents(eventsData);
      
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
  }, [searchParams, filter]);
  
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to page 1 when changing filter
    setSearchParams(params);
  };

  return (
    <div className="events-page">
      {/* Show back button if there's a search query or other filters */}
      {searchQuery && (
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      )}
      
      <div className="events-header">
        <h1 className="events-title">
          {searchQuery 
            ? `Search Results for "${searchQuery}"` 
            : filter === 'past' 
              ? 'Past Events' 
              : filter === 'all' 
                ? 'All Events' 
                : 'Upcoming Events'}
        </h1>
        <p className="events-subtitle">
          {filter === 'past' 
            ? 'Browse events that have already taken place.' 
            : 'Discover and join events happening near you.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => handleFilterChange('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => handleFilterChange('past')}
        >
          Past Events
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All Events
        </button>
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
              const isPastEvent = e.is_past; // Use backend calculation
              
              return (
                <div 
                  className={`event-card event-card-clickable ${isPastEvent ? 'past-event' : ''}`}
                  key={e.id}
                  onClick={() => navigate(`/events/${e.id}`)}
                >
                  {isPastEvent && <div className="event-status-badge past">EVENT ENDED</div>}
                  {!isPastEvent && isSoldOut && <div className="sold-out-badge">SOLD OUT</div>}
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

                    {!isPastEvent && (
                      <Link 
                        to={`/events/${e.id}`} 
                        className={`event-btn ${isSoldOut ? 'sold-out' : ''}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {isSoldOut ? 'Join Waitlist' : 'Buy Tickets'}
                      </Link>
                    )}
                    {isPastEvent && (
                      <Link 
                        to={`/events/${e.id}`} 
                        className="event-btn past"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View Details
                      </Link>
                    )}
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
