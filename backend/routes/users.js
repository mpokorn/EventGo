import express from "express";
import pool from "../db.js";

const router = express.Router();

/* --------------------------------------
   🟢 Get all users (optional role filter)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  const { role } = req.query; // e.g., /users?role=organizer

  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, created_at
      FROM users
      ${role ? "WHERE role = $1" : ""}
      ORDER BY created_at DESC;
      `,
      role ? [role] : []
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Napaka pri GET /users:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Get single user by ID
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Uporabnik z ID ${id} ne obstaja.` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Napaka pri GET /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Add new user
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Manjkajo potrebni podatki za dodajanje uporabnika!" });
  }

  try {
    // Check for duplicate email
    const emailCheck = await pool.query(`SELECT id FROM users WHERE email = $1;`, [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ message: "Uporabnik s tem e-naslovom že obstaja!" });
    }

    // In production: hash password here before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, COALESCE($4, 'user'))
      RETURNING id, name, email, role, created_at;
      `,
      [name, email, password, role]
    );

    res.status(201).json({
      message: "Uporabnik uspešno dodan!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri POST /users:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Update user
-------------------------------------- */
router.put("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, email, password, role } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    // Optional: prevent duplicate emails on update
    if (email) {
      const emailCheck = await pool.query(
        `SELECT id FROM users WHERE email = $1 AND id <> $2;`,
        [email, id]
      );
      if (emailCheck.rowCount > 0) {
        return res.status(400).json({ message: "Ta e-naslov je že v uporabi pri drugem uporabniku!" });
      }
    }

    const result = await pool.query(
      `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        role = COALESCE($4, role)
      WHERE id = $5
      RETURNING id, name, email, role, created_at;
      `,
      [name, email, password, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Uporabnik ni bil najden!" });
    }

    res.status(200).json({
      message: "Uporabnik uspešno posodobljen!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri PUT /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Delete user
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    // Optional: prevent deletion if they have events or transactions
    const check = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = $1) AS event_count,
        (SELECT COUNT(*) FROM transactions WHERE user_id = $1) AS transaction_count;
      `,
      [id]
    );

    const { event_count, transaction_count } = check.rows[0];
    if (parseInt(event_count) > 0 || parseInt(transaction_count) > 0) {
      return res.status(400).json({
        message: "Uporabnika ni mogoče izbrisati, ker ima povezane dogodke ali transakcije.",
      });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, created_at;",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Uporabnik ni bil najden!" });
    }

    res.status(200).json({
      message: "Uporabnik uspešno izbrisan!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Napaka pri DELETE /users/:id:", err);
    next(err);
  }
});

export default router;
