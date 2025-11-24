import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import OrganizerLayout from "../../components/OrganizerLayout";
import { AnalyticsCardSkeleton, TableSkeleton } from "../../components/SkeletonLoaders";
import api from "../../api/api";
import "../../styles/organizer.css";
import "../../styles/analytics.css";

export default function OrganizerAnalytics() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [eventRes, analyticsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/analytics`)
      ]);

      setEvent(eventRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OrganizerLayout title="Analytics">
        <div className="org-events-container">
          <Link to="/organizer/events" className="org-back-btn">
            ← Back to Events
          </Link>
          
          <div className="analytics-grid">
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
          </div>
          
          <div className="analytics-section">
            <h2 className="organizer-subtitle">Ticket Types Performance</h2>
            <TableSkeleton rows={3} columns={6} />
          </div>
        </div>
      </OrganizerLayout>
    );
  }

  if (error) {
    return (
      <OrganizerLayout title="Analytics">
        <p className="org-error">{error}</p>
      </OrganizerLayout>
    );
  }

  const soldPercentage = event ? ((event.tickets_sold / event.total_tickets) * 100).toFixed(1) : 0;
  const availableTickets = event ? event.total_tickets - event.tickets_sold : 0;

  return (
    <OrganizerLayout title="Event Analytics">
      <div className="org-events-container">
        <Link to="/organizer/events" className="org-back-btn">
          ← Back to Events
        </Link>

        <h1 className="organizer-title">{event?.title} - Analytics</h1>

        {/* Summary Cards */}
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon" style={{ background: 'var(--color-primary)' }}>
              🎟️
            </div>
            <div className="analytics-content">
              <h3>Tickets Sold</h3>
              <div className="analytics-value">{event?.tickets_sold || 0}</div>
              <div className="analytics-subtitle">of {event?.total_tickets || 0} total</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon" style={{ background: 'var(--color-success)' }}>
              💰
            </div>
            <div className="analytics-content">
              <h3>Total Revenue</h3>
              <div className="analytics-value">€{analytics?.totalRevenue || 0}</div>
              <div className="analytics-subtitle">{analytics?.transactionCount || 0} transactions</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon" style={{ background: 'var(--color-warning)' }}>
              📊
            </div>
            <div className="analytics-content">
              <h3>Sold Rate</h3>
              <div className="analytics-value">{soldPercentage}%</div>
              <div className="analytics-subtitle">{availableTickets} remaining</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon" style={{ background: 'var(--color-accent)' }}>
              ⏳
            </div>
            <div className="analytics-content">
              <h3>Waitlist</h3>
              <div className="analytics-value">{analytics?.waitlistCount || 0}</div>
              <div className="analytics-subtitle">people waiting</div>
            </div>
          </div>
        </div>

        {/* Ticket Types Breakdown */}
        <div className="analytics-section">
          <h2 className="organizer-subtitle">Ticket Types Performance</h2>
          <div className="ticket-types-table">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Total</th>
                  <th>Revenue</th>
                  <th>Sold %</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.ticketTypes?.map((tt) => (
                  <tr key={tt.id}>
                    <td><strong>{tt.type}</strong></td>
                    <td>€{tt.price}</td>
                    <td>{tt.tickets_sold}</td>
                    <td>{tt.total_tickets}</td>
                    <td><strong>€{(tt.tickets_sold * tt.price).toFixed(2)}</strong></td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${(tt.tickets_sold / tt.total_tickets * 100)}%`,
                            background: tt.tickets_sold >= tt.total_tickets ? 'var(--color-error)' : 'var(--color-success)'
                          }}
                        ></div>
                        <span className="progress-text">
                          {((tt.tickets_sold / tt.total_tickets) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Timeline */}
        <div className="analytics-section">
          <h2 className="organizer-subtitle">Recent Sales Activity</h2>
          {analytics?.recentSales && analytics.recentSales.length > 0 ? (
            <div className="sales-timeline">
              {analytics.recentSales.map((sale, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{sale.buyer_name}</strong>
                      <span className="timeline-date">{new Date(sale.created_at).toLocaleString()}</span>
                    </div>
                    <div className="timeline-details">
                      {sale.ticket_type} - €{sale.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="org-muted">No sales yet</p>
          )}
        </div>

        {/* Revenue by Payment Method */}
        {analytics?.paymentMethods && analytics.paymentMethods.length > 0 && (
          <div className="analytics-section">
            <h2 className="organizer-subtitle">Payment Methods</h2>
            <div className="payment-methods">
              {analytics.paymentMethods.map((pm, index) => (
                <div key={index} className="payment-method-item">
                  <div className="payment-method-label">
                    <span className="payment-icon">💳</span>
                    <span>{pm.payment_method}</span>
                  </div>
                  <div className="payment-method-stats">
                    <span className="payment-count">{pm.count} transactions</span>
                    <span className="payment-revenue">€{parseFloat(pm.total_revenue).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
