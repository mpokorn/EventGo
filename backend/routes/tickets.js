import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { assignTicketToWaitlist } from "./waitlist.js";

const router = express.Router();

// Protect all ticket routes
router.use(requireAuth);

/* --------------------------------------
    GET all tickets (with full details)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.user_id,
        (u.first_name || ' ' || u.last_name) AS buyer_name,
        t.owner_id,
        (o.first_name || ' ' || o.last_name) AS owner_name,
        t.event_id,
        e.title AS event_name,
        t.ticket_type_id,
        tt.type AS ticket_type,
        tt.price AS ticket_price,
        t.transaction_id,
        t.status,
        t.issued_at
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users o ON t.owner_id = o.id
      JOIN events e ON t.event_id = e.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      ORDER BY t.issued_at DESC;
    `);

    if (result.rowCount === 0) {
      return res.status(200).json({
        message: "No tickets found.",
        tickets: [],
      });
    }

    res.status(200).json({
      message: "All tickets retrieved successfully.",
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Error in GET /tickets:", err);
    next(err);
  }
});

/* --------------------------------------
    GET single ticket by ID
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID must be a number." });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        t.id,
        t.user_id,
        (u.first_name || ' ' || u.last_name) AS buyer_name,
        t.owner_id,
        (o.first_name || ' ' || o.last_name) AS owner_name,
        t.event_id,
        e.title AS event_name,
        t.ticket_type_id,
        tt.type AS ticket_type,
        tt.price AS ticket_price,
        t.transaction_id,
        t.status,
        t.issued_at
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users o ON t.owner_id = o.id
      JOIN events e ON t.event_id = e.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE t.id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Ticket with ID ${id} does not exist.` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(" Error in GET /tickets/:id:", err);
    next(err);
  }
});

/* --------------------------------------
    GET all tickets for a specific user
   (as buyer or current owner)
-------------------------------------- */
router.get("/user/:user_id", async (req, res, next) => {
  const user_id = parseInt(req.params.user_id);

  if (isNaN(user_id)) {
    return res.status(400).json({ message: "User ID must be a number." });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query(`SELECT id, first_name, last_name FROM users WHERE id = $1;`, [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    // Fetch all tickets where the user is the buyer or owner
    const result = await pool.query(
      `
      SELECT 
        t.id,
        t.user_id,
        (u.first_name || ' ' || u.last_name) AS buyer_name,
        t.owner_id,
        (o.first_name || ' ' || o.last_name) AS owner_name,
        t.event_id,
        e.title AS event_name,
        e.start_datetime,
        e.end_datetime,
        t.ticket_type_id,
        tt.type AS ticket_type,
        tt.price AS ticket_price,
        t.transaction_id,
        t.status,
        t.issued_at
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users o ON t.owner_id = o.id
      JOIN events e ON t.event_id = e.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE t.user_id = $1 OR t.owner_id = $1
      ORDER BY t.issued_at DESC;
      `,
      [user_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({
        message: `User ${userCheck.rows[0].first_name} ${userCheck.rows[0].last_name} has no tickets.`,
        tickets: [],
      });
    }

    res.status(200).json({
      message: "User tickets retrieved successfully.",
      user: {
        id: user_id,
        name: `${userCheck.rows[0].first_name} ${userCheck.rows[0].last_name}`,
      },
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Error in GET /tickets/user/:user_id:", err);
    next(err);
  }
});


/* --------------------------------------
    GET all tickets for a specific event
   (for organizer overview)
-------------------------------------- */
router.get("/event/:event_id", async (req, res, next) => {
  const event_id = parseInt(req.params.event_id);

  if (isNaN(event_id)) {
    return res.status(400).json({ message: "Event ID must be a number." });
  }

  try {
    // Check if event exists
    const eventCheck = await pool.query(
      `SELECT id, title FROM events WHERE id = $1;`,
      [event_id]
    );

    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Event does not exist!" });
    }

    // Get all tickets for this event
    const result = await pool.query(
      `
      SELECT 
        t.id,
        t.user_id,
        (u.first_name || ' ' || u.last_name) AS buyer_name,
        t.owner_id,
        (o.first_name || ' ' || o.last_name) AS owner_name,
        t.ticket_type_id,
        tt.type AS ticket_type,
        tt.price AS ticket_price,
        t.status,
        t.issued_at
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN users o ON t.owner_id = o.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE t.event_id = $1
      ORDER BY t.issued_at DESC;
      `,
      [event_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({
        message: `Event "${eventCheck.rows[0].title}" currently has no sold tickets.`,
        event_id,
        tickets: [],
      });
    }

    res.status(200).json({
      message: `Tickets for event "${eventCheck.rows[0].title}" retrieved successfully.`,
      event_id,
      event_title: eventCheck.rows[0].title,
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Error in GET /tickets/event/:event_id:", err);
    next(err);
  }
});





/* --------------------------------------
    Purchase new tickets (create transaction + tickets)
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { event_id, ticket_type_id, quantity = 1, payment_method } = req.body;
  const user_id = req.user.id; // Get user ID from authenticated token

  if (!event_id || !ticket_type_id || !quantity) {
    return res.status(400).json({ message: "Missing required data for ticket purchase!" });
  }

  try {
    // Validate user, event, and ticket type
    const [userCheck, eventCheck, typeCheck] = await Promise.all([
      pool.query(`SELECT id FROM users WHERE id = $1`, [user_id]),
      pool.query(`SELECT id FROM events WHERE id = $1`, [event_id]),
      pool.query(`SELECT total_tickets, tickets_sold, price FROM ticket_types WHERE id = $1`, [
        ticket_type_id,
      ]),
    ]);

    if (userCheck.rowCount === 0)
      return res.status(404).json({ message: "User does not exist!" });
    if (eventCheck.rowCount === 0)
      return res.status(404).json({ message: "Event does not exist!" });
    if (typeCheck.rowCount === 0)
      return res.status(404).json({ message: "Ticket type does not exist!" });

    const { total_tickets, tickets_sold, price } = typeCheck.rows[0];
    const available = total_tickets - tickets_sold;
    if (available < quantity) {
      return res.status(400).json({
        message: `Only ${available} tickets available for this type!`,
      });
    }

    // 🧾 Create transaction
    const total_price = Number(price) * quantity;
    const txResult = await pool.query(
      `INSERT INTO transactions (user_id, total_price, status, payment_method)
       VALUES ($1, $2, 'completed', $3)
       RETURNING id;`,
      [user_id, total_price, payment_method || "card"]
    );
    const transaction_id = txResult.rows[0].id;

    // Create tickets
    const insertPromises = [];
    for (let i = 0; i < quantity; i++) {
      insertPromises.push(
        pool.query(
          `INSERT INTO tickets (transaction_id, ticket_type_id, event_id, user_id, status)
           VALUES ($1, $2, $3, $4, 'active');`,
          [transaction_id, ticket_type_id, event_id, user_id]
        )
      );
    }
    await Promise.all(insertPromises);

    // Update counts
    await pool.query(
      `UPDATE ticket_types SET tickets_sold = tickets_sold + $1 WHERE id = $2;`,
      [quantity, ticket_type_id]
    );
    
    // Update event's tickets_sold AND total_tickets based on ticket types
    await pool.query(
      `UPDATE events
       SET tickets_sold = (
         SELECT COALESCE(SUM(tickets_sold), 0)
         FROM ticket_types
         WHERE event_id = $1
       ),
       total_tickets = (
         SELECT COALESCE(SUM(total_tickets), 0)
         FROM ticket_types
         WHERE event_id = $1
       )
       WHERE id = $1;`,
      [event_id]
    );

    res.status(201).json({
      message: `Successfully purchased ${quantity} ticket(s)!`,
      transaction_id,
      total_price,
      quantity,
      payment_method: payment_method || "card",
    });
  } catch (err) {
    console.error(" Error in POST /tickets:", err);
    next(err);
  }
});

/* --------------------------------------
    Refund ticket - Always goes to waitlist system
-------------------------------------- */
router.put("/:id/refund", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID must be a number." });

  try {
    // Get ticket details and check event status
    const ticketCheck = await pool.query(
      `
      SELECT 
        t.id, t.ticket_type_id, t.event_id, t.user_id, t.status,
        e.tickets_sold, e.total_tickets,
        tt.type as ticket_type_name
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE t.id = $1;
      `,
      [id]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    const ticket = ticketCheck.rows[0];

    if (ticket.status !== 'active') {
      return res.status(400).json({ message: "Only active tickets can be refunded!" });
    }

    const isSoldOut = ticket.tickets_sold >= ticket.total_tickets;

    // Check if event is sold out - only allow returns for sold out events
    if (!isSoldOut) {
      return res.status(400).json({ 
        message: "You can only return tickets for sold out events. This event still has available tickets."
      });
    }

    // Change status to 'pending_return' - user keeps ticket until someone buys it
    const result = await pool.query(
      `UPDATE tickets SET status = 'pending_return' WHERE id = $1 RETURNING *;`,
      [id]
    );

    // Try to assign to waitlist if anyone is waiting
    const waitlistAssignment = await assignTicketToWaitlist(ticket.event_id, ticket.ticket_type_id);

    // Message based on waitlist assignment
    const message = waitlistAssignment.assigned
      ? "Your ticket has been offered to someone on the waitlist. You'll keep access until they accept it."
      : "Your return request has been submitted. You'll keep the ticket until someone from the waitlist purchases it.";

    res.status(200).json({
      message,
      ticket: result.rows[0],
      assigned_to_waitlist: waitlistAssignment.assigned
    });
  } catch (err) {
    console.error(" Error in PUT /tickets/:id/refund:", err);
    next(err);
  }
});

/* --------------------------------------
    Resell/Transfer ticket to another user
-------------------------------------- */
router.put("/:id/resell", async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { new_owner_id } = req.body;
  const current_user_id = req.user.id;

  if (isNaN(id)) return res.status(400).json({ message: "ID must be a number." });
  if (!new_owner_id) return res.status(400).json({ message: "Missing new owner ID!" });

  try {
    // Check if ticket exists and belongs to current user
    const ticketCheck = await pool.query(
      `SELECT * FROM tickets WHERE id = $1 AND (user_id = $2 OR owner_id = $2) AND status = 'active';`,
      [id, current_user_id]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ 
        message: "Ticket not found or you don't have permission to transfer!" 
      });
    }

    // Check if new owner exists
    const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1;`, [new_owner_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "New owner does not exist!" });
    }

    // Transfer ticket
    const result = await pool.query(
      `UPDATE tickets 
       SET owner_id = $1 
       WHERE id = $2 
       RETURNING *;`,
      [new_owner_id, id]
    );

    res.status(200).json({
      message: "Ticket successfully transferred!",
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error(" Error in PUT /tickets/:id/resell:", err);
    next(err);
  }
});

/* --------------------------------------
   Delete ticket
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID must be a number." });

  try {
    const result = await pool.query(`DELETE FROM tickets WHERE id = $1 RETURNING *;`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    res.status(200).json({
      message: "Ticket successfully deleted!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error(" Error in DELETE /tickets/:id:", err);
    next(err);
  }
});

export default router;