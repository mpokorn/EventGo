import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

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
        message: "Ni najdenih vstopnic.",
        tickets: [],
      });
    }

    res.status(200).json({
      message: "Vse vstopnice uspešno pridobljene.",
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Napaka pri GET /tickets:", err);
    next(err);
  }
});

/* --------------------------------------
    GET single ticket by ID
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
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
      return res.status(404).json({ message: `Vstopnica z ID ${id} ne obstaja.` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(" Napaka pri GET /tickets/:id:", err);
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
    return res.status(400).json({ message: "ID uporabnika mora biti število." });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query(`SELECT id, first_name, last_name FROM users WHERE id = $1;`, [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "Uporabnik ne obstaja!" });
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
        message: `Uporabnik ${userCheck.rows[0].first_name} ${userCheck.rows[0].last_name} nima vstopnic.`,
        tickets: [],
      });
    }

    res.status(200).json({
      message: "Uspešno pridobljene vstopnice uporabnika.",
      user: {
        id: user_id,
        name: `${userCheck.rows[0].first_name} ${userCheck.rows[0].last_name}`,
      },
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Napaka pri GET /tickets/user/:user_id:", err);
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
    return res.status(400).json({ message: "ID dogodka mora biti število." });
  }

  try {
    //  Preveri, če dogodek obstaja
    const eventCheck = await pool.query(
      `SELECT id, title FROM events WHERE id = $1;`,
      [event_id]
    );

    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ message: "Dogodek ne obstaja!" });
    }

    //  Pridobi vse vstopnice za ta dogodek
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
        message: `Dogodek "${eventCheck.rows[0].title}" trenutno nima prodanih vstopnic.`,
        event_id,
        tickets: [],
      });
    }

    res.status(200).json({
      message: `Uspešno pridobljene vstopnice za dogodek "${eventCheck.rows[0].title}".`,
      event_id,
      event_title: eventCheck.rows[0].title,
      total_tickets: result.rowCount,
      tickets: result.rows,
    });
  } catch (err) {
    console.error(" Napaka pri GET /tickets/event/:event_id:", err);
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
    return res.status(400).json({ message: "Manjkajo podatki za nakup vstopnic!" });
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
      return res.status(404).json({ message: "Uporabnik ne obstaja!" });
    if (eventCheck.rowCount === 0)
      return res.status(404).json({ message: "Dogodek ne obstaja!" });
    if (typeCheck.rowCount === 0)
      return res.status(404).json({ message: "Vrsta vstopnice ne obstaja!" });

    const { total_tickets, tickets_sold, price } = typeCheck.rows[0];
    const available = total_tickets - tickets_sold;
    if (available < quantity) {
      return res.status(400).json({
        message: `Na voljo je samo ${available} vstopnic za to vrsto!`,
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

    //  Create tickets
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
    await pool.query(
      `UPDATE events
       SET tickets_sold = (
         SELECT COALESCE(SUM(tickets_sold), 0)
         FROM ticket_types
         WHERE event_id = $1
       )
       WHERE id = $1;`,
      [event_id]
    );

    res.status(201).json({
      message: `Uspešno kupljeno ${quantity} vstopnic!`,
      transaction_id,
      total_price,
      quantity,
      payment_method: payment_method || "card",
    });
  } catch (err) {
    console.error(" Napaka pri POST /tickets:", err);
    next(err);
  }
});

/* --------------------------------------
    Refund ticket
-------------------------------------- */
router.put("/:id/refund", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID mora biti število." });

  try {
    const result = await pool.query(
      `
      UPDATE tickets
      SET status = 'refunded'
      WHERE id = $1 AND status = 'active'
      RETURNING *;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vstopnica ni bila najdena ali je že vrnjena!" });
    }

    res.status(200).json({
      message: "Vstopnica uspešno vrnjena!",
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error(" Napaka pri PUT /tickets/:id/refund:", err);
    next(err);
  }
});

/* --------------------------------------
   Delete ticket
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID mora biti število." });

  try {
    const result = await pool.query(`DELETE FROM tickets WHERE id = $1 RETURNING *;`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vstopnica ni bila najdena!" });
    }

    res.status(200).json({
      message: "Vstopnica uspešno izbrisana!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error(" Napaka pri DELETE /tickets/:id:", err);
    next(err);
  }
});

export default router;
