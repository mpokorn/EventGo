import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
    GET all events (sorted by start time)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
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
      ORDER BY e.start_datetime ASC;
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /events:", err);
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
   Create a new event (only organizer or admin)
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    location,
    total_tickets,
    organizer_id,
  } = req.body;

  // osnovna validacija
  if (!title || !start_datetime || !end_datetime || !location || !total_tickets || !organizer_id) {
    return res.status(400).json({
      message: "Manjkajo podatki za ustvarjanje dogodka ali niso pravilno strukturirani!",
    });
  }

  try {
    // 1️Preveri, če organizer obstaja in ima ustrezno vlogo
    const checkOrganizer = await pool.query(
      `SELECT role FROM users WHERE id = $1;`,
      [organizer_id]
    );

    if (checkOrganizer.rows.length === 0) {
      return res.status(404).json({ message: "Organizator ne obstaja!" });
    }

    const { role } = checkOrganizer.rows[0];
    if (role !== "organizer" && role !== "admin") {
      return res.status(403).json({ message: "Samo organizator ali admin lahko ustvari dogodek!" });
    }

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
   Update existing event (only organizer or admin)
-------------------------------------- */
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    start_datetime,
    end_datetime,
    location,
    total_tickets,
    organizer_id,
  } = req.body;

  try {
    //  Preveri, ali dogodek obstaja
    const eventCheck = await pool.query(
      `SELECT id, organizer_id FROM events WHERE id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Dogodek ni bil najden!" });
    }

    const event = eventCheck.rows[0];

    //  Preveri uporabnika, ki želi posodobiti dogodek
    const userCheck = await pool.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [organizer_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "Uporabnik ne obstaja!" });
    }

    const { role } = userCheck.rows[0];

    // 3 Preveri dovoljenja
    if (role !== "admin" && event.organizer_id !== parseInt(organizer_id)) {
      return res.status(403).json({
        message: "Samo admin ali organizator, ki je ustvaril dogodek, ga lahko ureja!",
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
   Delete event (only organizer or admin)
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { organizer_id } = req.body; // v praksi bi to prišlo iz JWT (req.user.id)

  try {
    // Preveri, ali dogodek obstaja
    const eventCheck = await pool.query(
      `SELECT id, organizer_id FROM events WHERE id = $1`,
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: "Dogodek ni bil najden!" });
    }

    const event = eventCheck.rows[0];

    //  Preveri uporabnika, ki poskuša izbrisati dogodek
    const userCheck = await pool.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [organizer_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "Uporabnik ne obstaja!" });
    }

    const { role } = userCheck.rows[0];

    //  Dovoli samo, če je admin ali lastnik dogodka
    if (role !== "admin" && event.organizer_id !== parseInt(organizer_id)) {
      return res.status(403).json({
        message: "Samo admin ali organizator, ki je ustvaril dogodek, ga lahko izbriše!",
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
