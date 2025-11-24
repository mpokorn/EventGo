import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* --------------------------------------
    GET all events with search and filtering
-------------------------------------- */
router.get("/", async (req, res, next) => {
  try {
    const { search, location, startDate, endDate, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let queryText = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.start_datetime,
        e.end_datetime,
        e.location,
        e.total_tickets,
        e.tickets_sold,
        e.created_at,
        CONCAT(u.first_name, ' ', u.last_name) AS organizer_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Search by title or description
    if (search) {
      queryText += ` AND (LOWER(e.title) LIKE $${paramCount} OR LOWER(e.description) LIKE $${paramCount})`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }
    
    // Filter by location
    if (location) {
      queryText += ` AND LOWER(e.location) LIKE $${paramCount}`;
      params.push(`%${location.toLowerCase()}%`);
      paramCount++;
    }
    
    // Filter by start date range
    if (startDate) {
      queryText += ` AND e.start_datetime >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    // Filter by end date range
    if (endDate) {
      queryText += ` AND e.start_datetime <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    // Only show upcoming events (where end_datetime or start_datetime is in the future)
    queryText += ` AND (e.end_datetime > NOW() OR (e.end_datetime IS NULL AND e.start_datetime > NOW()))`;
    
    queryText += ` ORDER BY e.start_datetime ASC`;
    
    // Get total count for pagination
    const countQuery = queryText.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
    const countResult = await pool.query(countQuery, params);
    const totalEvents = parseInt(countResult.rows[0].count);
    
    // Add pagination
    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(queryText, params);

    res.status(200).json({
      events: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / parseInt(limit)),
        totalEvents,
        eventsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Napaka pri GET /events:", err);
    next(err);
  }
});


/* --------------------------------------
   GET all events for a specific organizer (PROTECTED)
-------------------------------------- */
router.get("/organizer/:organizerId", requireAuth, async (req, res, next) => {
  const { organizerId } = req.params;

  // Verify user is requesting their own events
  if (req.user.id !== parseInt(organizerId)) {
    return res.status(403).json({ message: "You can only view your own events!" });
  }

  try {
    const result = await pool.query(
      `SELECT 
          e.id,
          e.title,
          e.description,
          e.start_datetime,
          e.end_datetime,
          e.location,
          e.total_tickets,
          e.tickets_sold,
          e.created_at
        FROM events e
        WHERE e.organizer_id = $1
        ORDER BY e.start_datetime ASC`,
      [organizerId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error GET /events/organizer/:organizerId:", err);
    next(err);
  }
});


/* --------------------------------------
    GET single event + its ticket types
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const eventResult = await pool.query(
      `SELECT e.*, CONCAT(u.first_name, ' ', u.last_name) AS organizer_name
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: `Dogodek z ID ${id} ne obstaja.` });
    }

    const event = eventResult.rows[0];

    //  Get ticket types for this event
    const ticketTypesResult = await pool.query(
      `SELECT id, type, price, total_tickets, tickets_sold, created_at
       FROM ticket_types
       WHERE event_id = $1
       ORDER BY price ASC`,
      [id]
    );

    event.ticket_types = ticketTypesResult.rows;

    res.status(200).json(event);
  } catch (err) {
    console.error("Napaka pri GET /events/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   Create a new event (PROTECTED - Organizers only)
-------------------------------------- */
router.post("/", requireAuth, async (req, res, next) => {
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    location,
    total_tickets,
  } = req.body;

  const organizer_id = req.user.id; // Get from JWT token

  // Verify user is an organizer
  if (req.user.role !== 'organizer') {
    return res.status(403).json({ message: "Only organizers can create events!" });
  }

  // osnovna validacija
  if (!title || !start_datetime || !end_datetime || !location || !total_tickets) {
    return res.status(400).json({
      message: "Manjkajo podatki za ustvarjanje dogodka ali niso pravilno strukturirani!",
    });
  }

  try {

    // 2️ Vstavi dogodek
    const sql = `
      INSERT INTO events (title, description, start_datetime, end_datetime, location, total_tickets, organizer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await pool.query(sql, [
      title,
      description,
      start_datetime,
      end_datetime,
      location,
      total_tickets,
      organizer_id,
    ]);

    res.status(201).json({
      message: "Dogodek uspešno dodan!",
      event: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri POST /events:", err);
    next(err);
  }
});

/* --------------------------------------
   Update existing event (PROTECTED - Own events only)
-------------------------------------- */
router.put("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    location,
    total_tickets,
  } = req.body;

  try {
    // Verify event exists and belongs to user
    const eventCheck = await pool.query(
      `SELECT id, organizer_id FROM events WHERE id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Dogodek ni bil najden!" });
    }

    const event = eventCheck.rows[0];

    // Check ownership
    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only edit your own events!",
      });
    }

    // Posodobi dogodek
    const sql = `
      UPDATE events
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_datetime = COALESCE($3, start_datetime),
          end_datetime = COALESCE($4, end_datetime),
          location = COALESCE($5, location),
          total_tickets = COALESCE($6, total_tickets)
      WHERE id = $7
      RETURNING *;
    `;

    const result = await pool.query(sql, [
      title,
      description,
      start_datetime,
      end_datetime,
      location,
      total_tickets,
      id,
    ]);

    res.status(200).json({
      message: "Dogodek uspešno posodobljen!",
      event: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri PUT /events/:id:", err);
    next(err);
  }
});



/* --------------------------------------
   Get event analytics (PROTECTED)
-------------------------------------- */
router.get("/:id/analytics", requireAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Verify event belongs to user
    const eventCheck = await pool.query(
      `SELECT organizer_id FROM events WHERE id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Event not found!" });
    }

    if (eventCheck.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({ message: "You can only view analytics for your own events!" });
    }
    // Get ticket types with sales data
    const ticketTypesResult = await pool.query(
      `SELECT id, type, price, total_tickets, tickets_sold
       FROM ticket_types
       WHERE event_id = $1
       ORDER BY price ASC`,
      [id]
    );

    // Get total revenue and transaction count
    const revenueResult = await pool.query(
      `SELECT 
        COALESCE(SUM(t.total_price), 0) as total_revenue,
        COUNT(DISTINCT t.id) as transaction_count
       FROM transactions t
       INNER JOIN tickets tk ON tk.transaction_id = t.id
       WHERE tk.event_id = $1 AND t.status = 'completed'`,
      [id]
    );

    // Get waitlist count
    const waitlistResult = await pool.query(
      `SELECT COUNT(*) as waitlist_count
       FROM waitlist
       WHERE event_id = $1`,
      [id]
    );

    // Get recent sales (last 10)
    const recentSalesResult = await pool.query(
      `SELECT 
        tk.id,
        tt.type as ticket_type,
        tt.price,
        CONCAT(u.first_name, ' ', u.last_name) as buyer_name,
        t.created_at
       FROM tickets tk
       INNER JOIN ticket_types tt ON tk.ticket_type_id = tt.id
       INNER JOIN transactions t ON tk.transaction_id = t.id
       INNER JOIN users u ON tk.user_id = u.id
       WHERE tk.event_id = $1 AND tk.status = 'active'
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [id]
    );

    // Get payment methods breakdown (exclude 'waitlist' as it's internal system status)
    const paymentMethodsResult = await pool.query(
      `SELECT 
        t.payment_method,
        COUNT(*) as count,
        SUM(t.total_price) as total_revenue
       FROM transactions t
       INNER JOIN tickets tk ON tk.transaction_id = t.id
       WHERE tk.event_id = $1 AND t.status = 'completed' AND t.payment_method != 'waitlist'
       GROUP BY t.payment_method
       ORDER BY total_revenue DESC`,
      [id]
    );

    res.status(200).json({
      ticketTypes: ticketTypesResult.rows,
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue).toFixed(2),
      transactionCount: parseInt(revenueResult.rows[0].transaction_count),
      waitlistCount: parseInt(waitlistResult.rows[0].waitlist_count),
      recentSales: recentSalesResult.rows,
      paymentMethods: paymentMethodsResult.rows,
    });
  } catch (err) {
    console.error("Error getting event analytics:", err);
    next(err);
  }
});

/* --------------------------------------
   Delete event (PROTECTED - Own events only)
-------------------------------------- */
router.delete("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Verify event exists and belongs to user
    const eventCheck = await pool.query(
      `SELECT id, organizer_id FROM events WHERE id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Dogodek ni bil najden!" });
    }

    const event = eventCheck.rows[0];

    // Check ownership
    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own events!",
      });
    }

    //  Izbriši dogodek
    const result = await pool.query(
      `DELETE FROM events WHERE id = $1 RETURNING *`,
      [id]
    );

    res.status(200).json({
      message: "Dogodek uspešno izbrisan!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /events/:id:", err);
    next(err);
  }
});


export default router;
