export default function ProfileTransactions({ transactions, tickets, loading }) {
  if (loading) {
    return (
      <section className="profile-card">
        <h2>My Transactions</h2>
        <p className="profile-muted">Loading transactions...</p>
      </section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <section className="profile-card">
        <h2>My Transactions</h2>
        <p className="profile-muted">No transactions found.</p>
      </section>
    );
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  // Helper to get tickets for a transaction
  const getTransactionTickets = (transactionId) => {
    return tickets?.filter(t => t.transaction_id === transactionId) || [];
  };

  // Helper to check if all tickets are refunded
  const areAllTicketsRefunded = (transactionId) => {
    const txTickets = getTransactionTickets(transactionId);
    return txTickets.length > 0 && txTickets.every(t => t.status === 'refunded');
  };

  return (
    <section className="profile-card">
      <h2>My Transactions</h2>
      <h4>View all your ticket purchases and transaction history</h4>

      <div className="transactions-list">
        {sortedTransactions.map((transaction) => {
          const isRefunded = areAllTicketsRefunded(transaction.id);
          const displayStatus = isRefunded ? 'refunded' : transaction.status;
          
          return (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-header">
                <div className="transaction-id">
                  <strong>Transaction #{transaction.id}</strong>
                  <span className={`transaction-status status-${displayStatus}`}>
                    {displayStatus}
                  </span>
                </div>
                <div className="transaction-amount">
                  €{parseFloat(transaction.total_price).toFixed(2)}
                </div>
              </div>

            <div className="transaction-details">
              <div className="transaction-detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{transaction.event_title || 'N/A'}</span>
              </div>

              <div className="transaction-detail-row">
                <span className="detail-label">Ticket Type:</span>
                <span className="detail-value">{transaction.ticket_type || 'N/A'}</span>
              </div>

              <div className="transaction-detail-row">
                <span className="detail-label">Quantity:</span>
                <span className="detail-value">{transaction.quantity || 1}</span>
              </div>

              <div className="transaction-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{transaction.payment_method}</span>
              </div>

              {transaction.reference_code && (
                <div className="transaction-detail-row">
                  <span className="detail-label">Reference Code:</span>
                  <span className="detail-value">{transaction.reference_code}</span>
                </div>
              )}

              <div className="transaction-detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(transaction.created_at).toLocaleString('sl-SI')}
                </span>
              </div>

              {isRefunded && (
                <div className="transaction-detail-row transaction-status-indicator">
                  <span className="detail-label transaction-status-success">Status:</span>
                  <span className="detail-value transaction-status-success">
                    ✓ Tickets refunded - purchased by someone on the waitlist
                  </span>
                </div>
              )}
            </div>
          </div>
        );
        })}
      </div>
    </section>
  );
}
