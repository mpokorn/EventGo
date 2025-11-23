import '../styles/skeleton.css';

export function EventCardSkeleton() {
  return (
    <div className="event-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
}

export function EventsGridSkeleton({ count = 6 }) {
  return (
    <div className="events-grid">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TicketCardSkeleton() {
  return (
    <li className="ticket-item skeleton-card">
      <div className="ticket-info" style={{ flex: 1 }}>
        <div className="skeleton skeleton-title" style={{ width: '60%' }}></div>
        <div className="ticket-meta" style={{ marginTop: '0.5rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '0.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: '0.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '45%' }}></div>
        </div>
      </div>
      <div className="skeleton skeleton-button" style={{ width: '120px', height: '40px' }}></div>
    </li>
  );
}

export function TicketListSkeleton({ count = 3 }) {
  return (
    <ul className="ticket-list">
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </ul>
  );
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-button"></div></td>
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <table className="org-table">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <td key={j}>
                <div className="skeleton skeleton-text"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AnalyticsCardSkeleton() {
  return (
    <div className="analytics-card skeleton-card">
      <div className="skeleton skeleton-icon"></div>
      <div className="analytics-content" style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '0.5rem' }}></div>
        <div className="skeleton skeleton-title" style={{ width: '40%', marginBottom: '0.5rem' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="profile-card skeleton-card">
      <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }}></div>
      <div className="skeleton skeleton-text" style={{ marginBottom: '0.5rem' }}></div>
      <div className="skeleton skeleton-text" style={{ marginBottom: '0.5rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: '0.5rem' }}></div>
      <div className="skeleton skeleton-button" style={{ marginTop: '1rem' }}></div>
    </div>
  );
}
