import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Protect all modification routes (POST, PUT, DELETE)
// GET routes can remain public for browsing

/* --------------------------------------
    Get all ticket types for a specific event
-------------------------------------- */
router.get("/:event_id", async (req, res, next) => {
  const { event_id } = req.params;

  if (isNaN(event_id)) {
    return res.status(400).json({ message: "Event ID must be a number." });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        tt.id, 
        tt.type, 
        tt.price, 
        tt.total_tickets, 
        tt.tickets_sold, 
        tt.created_at,
        e.title AS event_name,
        e.start_datetime
      FROM ticket_types tt
      JOIN events e ON tt.event_id = e.id
      WHERE tt.event_id = $1
      ORDER BY tt.price ASC;
      `,
      [event_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No ticket types defined for this event." });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error in GET /ticket-types/:event_id:", err);
    next(err);
  }
});

/* --------------------------------------
    Add new ticket type (PROTECTED - event owner only)
-------------------------------------- */
router.post("/", requireAuth, async (req, res, next) => {
  const { event_id, type, price, total_tickets } = req.body;

  if (!event_id || !type || !price || !total_tickets) {
    return res.status(400).json({
      message: "Missing or improperly structured ticket data!",
    });
  }

  try {
    // Verify that the event exists and belongs to user
    const eventCheck = await pool.query(`SELECT id, organizer_id FROM events WHERE id = $1`, [event_id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Event with this ID does not exist!" });
    }
    
    if (eventCheck.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: "You can only create ticket types for your own events!" });
    }

    const result = await pool.query(
      `
      INSERT INTO ticket_types (event_id, type, price, total_tickets, tickets_sold)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING *;
      `,
      [event_id, type, price, total_tickets]
    );

    // Sync event's total_tickets
    await pool.query(
      `UPDATE events
       SET total_tickets = (
         SELECT COALESCE(SUM(total_tickets), 0)
         FROM ticket_types
         WHERE event_id = $1
       )
       WHERE id = $1;`,
      [event_id]
    );

    res.status(201).json({
      message: "Ticket type successfully added!",
      ticket_type: result.rows[0],
    });
  } catch (err) {
    console.error("Error in POST /ticket-types:", err);
    next(err);
  }
});

/* --------------------------------------
    Update existing ticket type
-------------------------------------- */
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { type, price, total_tickets, tickets_sold } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "Ticket type ID must be a number." });
  }

  try {
    const result = await pool.query(
      `
      UPDATE ticket_types
      SET 
        type = COALESCE($1, type),
        price = COALESCE($2, price),
        total_tickets = COALESCE($3, total_tickets),
        tickets_sold = COALESCE($4, tickets_sold)
      WHERE id = $5
      RETURNING *;
      `,
      [type, price, total_tickets, tickets_sold, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket type not found!" });
    }

    // Sync event's total_tickets and tickets_sold
    const ticketTypeRow = result.rows[0];
    await pool.query(
      `UPDATE events
       SET total_tickets = (
         SELECT COALESCE(SUM(total_tickets), 0)
         FROM ticket_types
         WHERE event_id = $1
       ),
       tickets_sold = (
         SELECT COALESCE(SUM(tickets_sold), 0)
         FROM ticket_types
         WHERE event_id = $1
       )
       WHERE id = $1;`,
      [ticketTypeRow.event_id]
    );

    res.status(200).json({
      message: "Ticket type successfully updated!",
      ticket_type: result.rows[0],
    });
  } catch (err) {
    console.error("Error in PATCH /ticket-types/:id:", err);
    next(err);
  }
});

/* --------------------------------------
    Delete ticket type (PROTECTED - event owner only)
-------------------------------------- */
router.delete("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID must be a number." });
  }

  try {
    // Verify ticket type belongs to user's event
    const ownerCheck = await pool.query(
      `SELECT tt.id, e.organizer_id 
       FROM ticket_types tt 
       JOIN events e ON tt.event_id = e.id 
       WHERE tt.id = $1`,
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Ticket type not found!" });
    }

    if (ownerCheck.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete ticket types for your own events!" });
    }

    // Check if any tickets have been sold for this type
    const usageCheck = await pool.query(
      `SELECT COUNT(*) AS sold FROM tickets WHERE ticket_type_id = $1;`,
      [id]
    );

    if (parseInt(usageCheck.rows[0].sold) > 0) {
      return res.status(400).json({
        message: "Cannot delete this ticket type because tickets have already been sold!",
      });
    }

    const result = await pool.query(
      `DELETE FROM ticket_types WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket type not found!" });
    }

    // Sync event's total_tickets after deletion
    const deletedType = result.rows[0];
    await pool.query(
      `UPDATE events
       SET total_tickets = (
         SELECT COALESCE(SUM(total_tickets), 0)
         FROM ticket_types
         WHERE event_id = $1
       ),
       tickets_sold = (
         SELECT COALESCE(SUM(tickets_sold), 0)
         FROM ticket_types
         WHERE event_id = $1
       )
       WHERE id = $1;`,
      [deletedType.event_id]
    );

    res.status(200).json({
      message: "Ticket type successfully deleted!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Error in DELETE /ticket-types/:id:", err);
    next(err);
  }
});

router.put("/:id/recount", requireAuth, async (req, res, next) => {
  const { id } = req.params;
  await pool.query(`
    UPDATE ticket_types
    SET tickets_sold = (
      SELECT COUNT(*) FROM tickets WHERE ticket_type_id = $1
    )
    WHERE id = $1;
  `, [id]);
  res.json({ message: "Number of sold tickets refreshed!" });
});

// Sync ALL ticket types and events (useful for fixing data)
router.post("/sync-all", requireAuth, async (req, res, next) => {
  try {
    // 1. Update all ticket_types.tickets_sold based on actual tickets
    const result = await pool.query(`
      UPDATE ticket_types tt
      SET tickets_sold = (
        SELECT COUNT(*) FROM tickets t 
        WHERE t.ticket_type_id = tt.id
      )
      RETURNING id, type, tickets_sold, total_tickets;
    `);

    // 2. Update all events.total_tickets and tickets_sold from ticket_types
    await pool.query(`
      UPDATE events e
      SET 
        total_tickets = (
          SELECT COALESCE(SUM(total_tickets), 0)
          FROM ticket_types
          WHERE event_id = e.id
        ),
        tickets_sold = (
          SELECT COALESCE(SUM(tickets_sold), 0)
          FROM ticket_types
          WHERE event_id = e.id
        );
    `);

    res.json({ 
      message: "All ticket counts synchronized successfully!",
      success: true,
      ticket_types_updated: result.rows
    });
  } catch (err) {
    console.error("Error in sync-all:", err);
    next(err);
  }
});

// Debug endpoint to check ticket count discrepancies
router.get("/debug/:event_id", async (req, res, next) => {
  const { event_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        tt.id as ticket_type_id,
        tt.type,
        tt.total_tickets,
        tt.tickets_sold as stored_count,
        (SELECT COUNT(*) FROM tickets t WHERE t.ticket_type_id = tt.id) as actual_count
      FROM ticket_types tt
      WHERE tt.event_id = $1;
    `, [event_id]);
    
    res.json({
      event_id,
      ticket_types: result.rows
    });
  } catch (err) {
    console.error("Error in debug:", err);
    next(err);
  }
});


export default router;
