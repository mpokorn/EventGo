import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
   🟢 Get all waitlist entries (optional filters)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  const { event_id, user_id } = req.query;

  try {
    let query = `
      SELECT 
        w.id,
        w.user_id,
        u.name AS user_name,
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
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /waitlist:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Get all users on the waitlist for a specific event
-------------------------------------- */
router.get("/event/:event_id", async (req, res, next) => {
  const { event_id } = req.params;

  if (isNaN(event_id)) {
    return res.status(400).json({ message: "ID dogodka mora biti število." });
  }

  try {
    // Check if event exists
    const eventCheck = await pool.query(
      `SELECT id, title FROM events WHERE id = $1;`,
      [event_id]
    );
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Dogodek ne obstaja!" });
    }

    // Query waitlist entries
    const result = await pool.query(
      `
      SELECT 
        w.id,
        w.user_id,
        u.name AS user_name,
        u.email,
        w.joined_at
      FROM waitlist w
      JOIN users u ON w.user_id = u.id
      WHERE w.event_id = $1
      ORDER BY w.joined_at ASC;
      `,
      [event_id]
    );

    // If waitlist empty
    if (result.rowCount === 0) {
      return res.status(200).json({
        message: `Čakalna lista za dogodek "${eventCheck.rows[0].title}" je trenutno prazna.`,
        waitlist: [],
      });
    }

    // Otherwise return the waitlist users
    res.status(200).json({
      event_id: event_id,
      event_title: eventCheck.rows[0].title,
      total_waiting: result.rowCount,
      waitlist: result.rows,
    });
  } catch (err) {
    console.error("Napaka pri GET /waitlist/event/:event_id:", err);
    next(err);
  }
});


/* --------------------------------------
   🟢 Add a user to the waitlist for an event
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { user_id, event_id } = req.body;

  if (!user_id || !event_id) {
    return res.status(400).json({ message: "Manjkajo podatki: user_id in event_id sta obvezna!" });
  }

  try {
    // Validate user and event exist
    const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1;`, [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "Uporabnik ne obstaja!" });
    }

    const eventCheck = await pool.query(`SELECT id FROM events WHERE id = $1;`, [event_id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Dogodek ne obstaja!" });
    }

    // Check if user already on waitlist for this event
    const existing = await pool.query(
      `SELECT id FROM waitlist WHERE user_id = $1 AND event_id = $2;`,
      [user_id, event_id]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Uporabnik je že na čakalni listi za ta dogodek!" });
    }

    // Add new entry
    const result = await pool.query(
      `
      INSERT INTO waitlist (user_id, event_id)
      VALUES ($1, $2)
      RETURNING id, user_id, event_id, joined_at;
      `,
      [user_id, event_id]
    );

    res.status(201).json({
      message: "Uporabnik uspešno dodan na čakalno listo!",
      entry: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri POST /waitlist:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Remove a user from waitlist (by entry ID)
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM waitlist WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Uporabnik ni bil najden na čakalni listi!" });
    }

    res.status(200).json({
      message: "Uporabnik uspešno odstranjen iz čakalne liste!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /waitlist/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Optional: Remove user from waitlist by event & user
-------------------------------------- */
router.delete("/event/:event_id/user/:user_id", async (req, res, next) => {
  const { event_id, user_id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM waitlist WHERE event_id = $1 AND user_id = $2 RETURNING *;`,
      [event_id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vnos na čakalni listi ni bil najden!" });
    }

    res.status(200).json({
      message: "Uporabnik odstranjen iz čakalne liste za dogodek!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /waitlist/event/:event_id/user/:user_id:", err);
    next(err);
  }
});

export default router;
