import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
  Get all waitlist entries (optional filters)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  const { event_id, user_id } = req.query;

  try {
    let query = `
      SELECT 
        w.id,
        w.user_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        u.email AS user_email,
        w.event_id,
        e.title AS event_title,
        e.start_datetime,
        w.joined_at
      FROM waitlist w
      JOIN users u ON w.user_id = u.id
      JOIN events e ON w.event_id = e.id
    `;

    const params = [];
    if (event_id) {
      query += ` WHERE w.event_id = $1`;
      params.push(event_id);
    } else if (user_id) {
      query += ` WHERE w.user_id = $1`;
      params.push(user_id);
    }

    query += ` ORDER BY w.joined_at ASC;`;

    const result = await pool.query(query, params);

    return res.status(200).json({
      message: "Waitlist entries retrieved successfully.",
      total_entries: result.rowCount,
      waitlist: result.rows,
    });

  } catch (err) {
    console.error(" Error in GET /waitlist:", err);
    next(err);
  }
});

/* --------------------------------------
  Get waitlist for a specific event
-------------------------------------- */
router.get("/event/:event_id", async (req, res, next) => {
  const { event_id } = req.params;

  if (isNaN(event_id)) {
    return res.status(400).json({ message: "Event ID must be a number." });
  }

  try {
    const eventCheck = await pool.query(
      `SELECT id, title FROM events WHERE id = $1;`,
      [event_id]
    );

    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Event does not exist!" });
    }

    const result = await pool.query(
      `
      SELECT 
        w.id,
        w.user_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        u.email,
        w.joined_at
      FROM waitlist w
      JOIN users u ON w.user_id = u.id
      WHERE w.event_id = $1
      ORDER BY w.joined_at ASC;
      `,
      [event_id]
    );

    return res.status(200).json({
      event_id,
      event_title: eventCheck.rows[0].title,
      total_waiting: result.rowCount,
      waitlist: result.rows,
    });

  } catch (err) {
    console.error(" Error in GET /waitlist/event/:event_id:", err);
    next(err);
  }
});

/* --------------------------------------
  Get waitlist for a specific user
-------------------------------------- */
router.get("/user/:user_id", async (req, res, next) => {
  const { user_id } = req.params;

  if (isNaN(user_id)) {
    return res.status(400).json({ message: "User ID must be a number." });
  }

  try {
    const result = await pool.query(
      `
      WITH ranked_waitlist AS (
        SELECT 
          w.id,
          w.user_id,
          w.event_id,
          w.joined_at,
          ROW_NUMBER() OVER (PARTITION BY w.event_id ORDER BY w.joined_at ASC) as position
        FROM waitlist w
      )
      SELECT 
        rw.id,
        rw.user_id,
        (u.first_name || ' ' || u.last_name) AS user_name,
        u.email AS user_email,
        rw.event_id,
        e.title AS event_name,
        e.start_datetime,
        e.end_datetime,
        rw.joined_at,
        rw.position
      FROM ranked_waitlist rw
      JOIN users u ON rw.user_id = u.id
      JOIN events e ON rw.event_id = e.id
      WHERE rw.user_id = $1
      ORDER BY rw.joined_at ASC;
      `,
      [user_id]
    );

    return res.status(200).json({ waitlist: result.rows });

  } catch (err) {
    console.error("Error in GET /waitlist/user/:user_id:", err);
    next(err);
  }
});

/* --------------------------------------
  Add user to waitlist
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { user_id, event_id } = req.body;

  if (!user_id || !event_id) {
    return res.status(400).json({
      message: "Missing required data: user_id and event_id are required!",
    });
  }

  try {
    // Validate user
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    );
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    // Validate event
    const eventCheck = await pool.query(
      `SELECT id, total_tickets, tickets_sold FROM events WHERE id = $1`,
      [event_id]
    );
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Event does not exist!" });
    }

    const event = eventCheck.rows[0];

    // Check if sold out
    if (event.tickets_sold < event.total_tickets) {
      return res.status(400).json({
        message: "Event is not sold out — purchase is available!",
      });
    }

    // Prevent duplicate entry
    const existing = await pool.query(
      `SELECT id FROM waitlist WHERE user_id = $1 AND event_id = $2`,
      [user_id, event_id]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        message: "User is already on the waitlist for this event!",
      });
    }

    // Check if there are any pending_return tickets for this event
    const pendingTicketCheck = await pool.query(
      `SELECT t.id, t.ticket_type_id, tt.price 
       FROM tickets t
       LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE t.event_id = $1 AND t.status = 'pending_return'
       ORDER BY t.issued_at ASC
       LIMIT 1;`,
      [event_id]
    );

    // If there's a pending_return ticket, offer it immediately instead of joining waitlist
    if (pendingTicketCheck.rows.length > 0) {
      const pendingTicket = pendingTicketCheck.rows[0];
      
      // Create PENDING transaction for this user
      const txResult = await pool.query(
        `INSERT INTO transactions (user_id, total_price, status, payment_method)
         VALUES ($1, $2, 'pending', 'waitlist')
         RETURNING id;`,
        [user_id, pendingTicket.price || 0]
      );
      const transaction_id = txResult.rows[0].id;

      // Create reserved ticket for the user
      await pool.query(
        `INSERT INTO tickets (transaction_id, ticket_type_id, event_id, user_id, status)
         VALUES ($1, $2, $3, $4, 'reserved');`,
        [transaction_id, pendingTicket.ticket_type_id, event_id, user_id]
      );

      return res.status(201).json({
        message: "A ticket is available! You have been offered a returned ticket. Please accept or decline it.",
        ticket_offered: true,
        transaction_id: transaction_id
      });
    }

    // No pending tickets available, join waitlist normally
    const inserted = await pool.query(
      `INSERT INTO waitlist (user_id, event_id)
       VALUES ($1, $2)
       RETURNING *;`,
      [user_id, event_id]
    );

    // Calculate position in waitlist using ROW_NUMBER
    const positionResult = await pool.query(
      `SELECT position FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY joined_at ASC) as position
        FROM waitlist 
        WHERE event_id = $1
      ) ranked
      WHERE id = $2;`,
      [event_id, inserted.rows[0].id]
    );

    return res.status(201).json({
      message: "User successfully added to waitlist!",
      entry: inserted.rows[0],
      position: parseInt(positionResult.rows[0].position)
    });

  } catch (err) {
    console.error("Error in POST /waitlist:", err);
    next(err);
  }
});

/* --------------------------------------
  Remove user from waitlist (by entry ID)
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID must be a number." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM waitlist WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    return res.status(200).json({
      message: "User removed from waitlist.",
      deleted: result.rows[0],
    });

  } catch (err) {
    console.error("Error in DELETE /waitlist/:id:", err);
    next(err);
  }
});

/* --------------------------------------
  Remove user from waitlist by event + user
-------------------------------------- */
router.delete("/event/:event_id/user/:user_id", async (req, res, next) => {
  const { event_id, user_id } = req.params;

  if (isNaN(event_id) || isNaN(user_id)) {
    return res.status(400).json({
      message: "Event ID and User ID must be numbers.",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM waitlist WHERE event_id = $1 AND user_id = $2 RETURNING *;`,
      [event_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "User not found on waitlist!",
      });
    }

    return res.status(200).json({
      message: "User removed from waitlist!",
      deleted: result.rows[0],
    });

  } catch (err) {
    console.error("Error in DELETE /waitlist/event/:event_id/user/:user_id:", err);
    next(err);
  }
});

/* --------------------------------------
  Helper: Auto-assign ticket to next waitlist user
  Called when a ticket is refunded
  Creates a PENDING transaction that user must accept
-------------------------------------- */
export async function assignTicketToWaitlist(event_id, ticket_type_id) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find first person in waitlist with row-level locking to prevent race conditions
    const waitlistResult = await client.query(
      `SELECT * FROM waitlist 
       WHERE event_id = $1 
       ORDER BY joined_at ASC 
       LIMIT 1
       FOR UPDATE SKIP LOCKED;`,
      [event_id]
    );

    if (waitlistResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { assigned: false };
    }

    const waitlistUser = waitlistResult.rows[0];
    
    // Get ticket type and price
    const ticketTypeResult = await client.query(
      `SELECT price FROM ticket_types WHERE id = $1;`,
      [ticket_type_id]
    );
    const price = ticketTypeResult.rows[0]?.price || 0;

    // Create PENDING transaction for the waitlist user (they must accept)
    const txResult = await client.query(
      `INSERT INTO transactions (user_id, total_price, status, payment_method)
       VALUES ($1, $2, 'pending', 'waitlist')
       RETURNING id;`,
      [waitlistUser.user_id, price]
    );
    const transaction_id = txResult.rows[0].id;

    // Ticket status lifecycle:
    //   'reserved' - Ticket is held for a user promoted from the waitlist; user must accept and complete payment to activate.
    //   'active'   - Ticket is fully purchased and valid for event entry.
    //   'refunded' - Ticket has been refunded and is no longer valid.
    //
    // Here, we create a ticket with 'reserved' status for the waitlist user. The ticket will become 'active' once the user accepts and completes payment.
    await client.query(
      `INSERT INTO tickets (transaction_id, ticket_type_id, event_id, user_id, status)
       VALUES ($1, $2, $3, $4, 'reserved');`,
      [transaction_id, ticket_type_id, event_id, waitlistUser.user_id]
    );

    // Remove from waitlist (they now have a reserved ticket)
    await client.query(
      `DELETE FROM waitlist WHERE id = $1;`,
      [waitlistUser.id]
    );

    // Don't increment tickets_sold yet - only when they accept!

    await client.query('COMMIT');

    return { 
      assigned: true, 
      user_id: waitlistUser.user_id,
      transaction_id: transaction_id
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Error in assignTicketToWaitlist:", error);
    throw error;
  } finally {
    client.release();
  }
}

/* --------------------------------------
  Accept reserved ticket from waitlist
-------------------------------------- */
router.post("/accept-ticket/:transaction_id", async (req, res, next) => {
  const transaction_id = parseInt(req.params.transaction_id);
  
  if (isNaN(transaction_id)) {
    return res.status(400).json({ message: "Transaction ID must be a number." });
  }

  try {
    // Get transaction and verify it's pending
    const txResult = await pool.query(
      `SELECT * FROM transactions WHERE id = $1 AND status = 'pending' AND payment_method = 'waitlist';`,
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ message: "Reservation not found or already confirmed!" });
    }

    // Get ticket info
    const ticketResult = await pool.query(
      `SELECT * FROM tickets WHERE transaction_id = $1 AND status = 'reserved';`,
      [transaction_id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    const ticket = ticketResult.rows[0];

    // Find the original ticket that's pending return for the same event and ticket type
    const pendingReturnTicket = await pool.query(
      `SELECT * FROM tickets 
       WHERE event_id = $1 
       AND ticket_type_id = $2 
       AND status = 'pending_return' 
       ORDER BY issued_at ASC 
       LIMIT 1;`,
      [ticket.event_id, ticket.ticket_type_id]
    );

    // Update transaction to completed
    await pool.query(
      `UPDATE transactions SET status = 'completed' WHERE id = $1;`,
      [transaction_id]
    );

    // Update ticket to active
    await pool.query(
      `UPDATE tickets SET status = 'active' WHERE id = $1;`,
      [ticket.id]
    );

    // If there was a ticket pending return, NOW refund it with 2% platform fee
    let refundAmount = 0;
    let platformFee = 0;
    if (pendingReturnTicket.rows.length > 0) {
      const returnedTicket = pendingReturnTicket.rows[0];
      
      // Get original transaction to calculate refund (98% of original price)
      const originalTx = await pool.query(
        `SELECT total_price FROM transactions WHERE id = $1;`,
        [returnedTicket.transaction_id]
      );
      
      const originalPrice = parseFloat(originalTx.rows[0].total_price);
      platformFee = originalPrice * 0.02; // 2% fee
      refundAmount = originalPrice - platformFee;
      
      // Update ticket to refunded
      await pool.query(
        `UPDATE tickets SET status = 'refunded' WHERE id = $1;`,
        [returnedTicket.id]
      );
      
      // Create refund transaction record for the original owner
      await pool.query(
        `INSERT INTO transactions (user_id, total_price, status, payment_method)
         VALUES ($1, $2, 'refunded', 'waitlist_return');`,
        [returnedTicket.user_id, -refundAmount]
      );
    }

    // Decrement tickets_sold by 1 (removing pending_return ticket) then increment by 1 (adding new active ticket)
    // Net effect: tickets_sold stays the same, just ownership changes
    // So we don't need to update tickets_sold count

    return res.status(200).json({
      message: refundAmount > 0 
        ? `Ticket accepted successfully! Previous owner will receive a refund of €${refundAmount.toFixed(2)} (2% platform fee applied).`
        : "Ticket accepted successfully!",
      ticket: ticket,
      refunded_ticket_id: pendingReturnTicket.rows[0]?.id,
      refund_amount: refundAmount,
      platform_fee: platformFee.toFixed(2)
    });

  } catch (err) {
    console.error("Error accepting ticket:", err);
    next(err);
  }
});

/* --------------------------------------
  Decline reserved ticket from waitlist
-------------------------------------- */
router.post("/decline-ticket/:transaction_id", async (req, res, next) => {
  const transaction_id = parseInt(req.params.transaction_id);
  
  if (isNaN(transaction_id)) {
    return res.status(400).json({ message: "Transaction ID must be a number." });
  }

  try {
    // Get transaction and verify it's pending
    const txResult = await pool.query(
      `SELECT * FROM transactions WHERE id = $1 AND status = 'pending' AND payment_method = 'waitlist';`,
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ message: "Reservation not found!" });
    }

    // Get ticket info
    const ticketResult = await pool.query(
      `SELECT * FROM tickets WHERE transaction_id = $1 AND status = 'reserved';`,
      [transaction_id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    const ticket = ticketResult.rows[0];

    // Update transaction to cancelled
    await pool.query(
      `UPDATE transactions SET status = 'cancelled' WHERE id = $1;`,
      [transaction_id]
    );

    // Delete the reserved ticket
    await pool.query(
      `DELETE FROM tickets WHERE id = $1;`,
      [ticket.id]
    );

    // Assign to next person in waitlist
    const nextAssignment = await assignTicketToWaitlist(ticket.event_id, ticket.ticket_type_id);

    return res.status(200).json({
      message: "Reservation declined.",
      assigned_to_next: nextAssignment.assigned
    });

  } catch (err) {
    console.error("Error declining ticket:", err);
    next(err);
  }
});

export default router;
