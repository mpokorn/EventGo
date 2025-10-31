import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
   🟢 Get all transactions (with buyer + summary)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT 
        tr.id,
        tr.user_id AS buyer_id,
        u.name AS buyer_name,
        tr.total_price,
        tr.status,
        tr.payment_method,
        tr.reference_code,
        tr.created_at,
        COUNT(t.id) AS total_tickets
      FROM transactions tr
      JOIN users u ON tr.user_id = u.id
      LEFT JOIN tickets t ON tr.id = t.transaction_id
      GROUP BY tr.id, u.name
      ORDER BY tr.created_at DESC;
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /transactions:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Get all transactions for a specific user
-------------------------------------- */
router.get("/user/:id", async (req, res, next) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        tr.id,
        tr.user_id AS buyer_id,
        u.name AS buyer_name,
        tr.total_price,
        tr.status,
        tr.payment_method,
        tr.reference_code,
        tr.created_at,
        COUNT(t.id) AS total_tickets
      FROM transactions tr
      JOIN users u ON tr.user_id = u.id
      LEFT JOIN tickets t ON tr.id = t.transaction_id
      WHERE tr.user_id = $1
      GROUP BY tr.id, u.name
      ORDER BY tr.created_at DESC;
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /transactions/user/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Get one transaction with ticket details
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const transactionResult = await pool.query(
      `
      SELECT 
        tr.id,
        tr.user_id AS buyer_id,
        u.name AS buyer_name,
        tr.total_price,
        tr.status,
        tr.payment_method,
        tr.reference_code,
        tr.created_at
      FROM transactions tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.id = $1;
      `,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: "Transakcija ni bila najdena!" });
    }

    const ticketsResult = await pool.query(
      `
      SELECT 
        t.id,
        t.event_id,
        e.title AS event_name,
        t.ticket_type_id,
        tt.type AS ticket_type,
        tt.price AS ticket_price,
        t.status,
        t.issued_at
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
      WHERE t.transaction_id = $1;
      `,
      [id]
    );

    const transaction = transactionResult.rows[0];
    transaction.tickets = ticketsResult.rows;

    res.status(200).json(transaction);
  } catch (err) {
    console.error("Napaka pri GET /transactions/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Create new transaction manually (optional)
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { user_id, total_price, status, payment_method, reference_code } = req.body;

  if (!user_id || !total_price) {
    return res.status(400).json({ message: "Manjkajo podatki za ustvarjanje transakcije!" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO transactions (user_id, total_price, status, payment_method, reference_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [user_id, total_price, status || "completed", payment_method || "card", reference_code || null]
    );

    res.status(201).json({
      message: "Transakcija uspešno dodana!",
      transaction: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri POST /transactions:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Delete a transaction
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const result = await pool.query(`DELETE FROM transactions WHERE id = $1 RETURNING *;`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Transakcija ni bila najdena!" });
    }

    res.status(200).json({
      message: "Transakcija uspešno izbrisana!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /transactions/:id:", err);
    next(err);
  }
});

export default router;
