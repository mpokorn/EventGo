import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
   🟢 Get all ticket types for a specific event
-------------------------------------- */
router.get("/:event_id", async (req, res, next) => {
  const { event_id } = req.params;

  if (isNaN(event_id)) {
    return res.status(400).json({ message: "ID dogodka mora biti število." });
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
      return res.status(404).json({ message: "Za ta dogodek ni definiranih vrst vstopnic." });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /ticket-types/:event_id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Add new ticket type (admin/organizer)
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { event_id, type, price, total_tickets } = req.body;

  if (!event_id || !type || !price || !total_tickets) {
    return res.status(400).json({
      message: "Manjkajo podatki o vstopnici ali pa niso pravilno strukturirani!",
    });
  }

  try {
    // ✅ Verify that the event exists before creating ticket types
    const eventCheck = await pool.query(`SELECT id FROM events WHERE id = $1`, [event_id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Dogodek s tem ID-jem ne obstaja!" });
    }

    const result = await pool.query(
      `
      INSERT INTO ticket_types (event_id, type, price, total_tickets, tickets_sold)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING *;
      `,
      [event_id, type, price, total_tickets]
    );

    res.status(201).json({
      message: "Vrsta vstopnice uspešno dodana!",
      ticket_type: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri POST /ticket-types:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Update existing ticket type
-------------------------------------- */
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { type, price, total_tickets, tickets_sold } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID vstopnice mora biti število." });
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
      return res.status(404).json({ message: "Vrsta vstopnice ni bila najdena!" });
    }

    res.status(200).json({
      message: "Vrsta vstopnice uspešno posodobljena!",
      ticket_type: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri PATCH /ticket-types/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Delete ticket type (admin/organizer)
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    // Optional: Check if any tickets have been sold for this type
    const usageCheck = await pool.query(
      `SELECT COUNT(*) AS sold FROM tickets WHERE ticket_type_id = $1;`,
      [id]
    );

    if (parseInt(usageCheck.rows[0].sold) > 0) {
      return res.status(400).json({
        message: "Tega tipa vstopnic ni mogoče izbrisati, ker so že bile prodane!",
      });
    }

    const result = await pool.query(
      `DELETE FROM ticket_types WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vrsta vstopnice ni bila najdena!" });
    }

    res.status(200).json({
      message: "Vrsta vstopnice uspešno izbrisana!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /ticket-types/:id:", err);
    next(err);
  }
});

router.put("/:id/recount", async (req, res, next) => {
  const { id } = req.params;
  await pool.query(`
    UPDATE ticket_types
    SET tickets_sold = (
      SELECT COUNT(*) FROM tickets WHERE ticket_type_id = $1
    )
    WHERE id = $1;
  `, [id]);
  res.json({ message: "Število prodanih vstopnic osveženo!" });
});


export default router;
