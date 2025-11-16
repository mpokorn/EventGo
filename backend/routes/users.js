// src/routes/users.js
import express from "express";
import pool from "../db.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

const router = express.Router();

/* --------------------------------------
    User Registration (normal + organizer)
-------------------------------------- */
router.post("/register", async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Vsa polja so obvezna!"
    });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Uporabnik s tem e-naslovom že obstaja!"
      });
    }

    // Allowed roles from frontend for registration
    const allowedRoles = ["user", "organizer", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Neveljavna vloga '${role}'. Dovoljene vloge so: ${allowedRoles.join(", ")}.`
      });
    }

    const hashedPassword = await hashPassword(password);

    // Insert user
    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'user')::user_role)
      RETURNING id, first_name, last_name, email, role;
      `,
      [first_name, last_name, email, hashedPassword, role]
    );

    const token = generateToken(result.rows[0]);

    res.status(201).json({
      message: "Registracija uspešna!",
      token,
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Napaka pri registraciji:", err);
    next(err);
  }
});

/* --------------------------------------
    User Login (normal + organizer)
-------------------------------------- */
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "E-pošta in geslo sta obvezna!"
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Napačna e-pošta ali geslo!"
      });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Napačna e-pošta ali geslo!"
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Prijava uspešna!",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Napaka pri prijavi:", err);
    next(err);
  }
});

/* --------------------------------------
    Organizer Registration (direct)
-------------------------------------- */
router.post("/organizer-register", async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Vsa polja so obvezna!"
    });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Uporabnik s tem e-naslovom že obstaja!"
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, 'organizer'::user_role)
      RETURNING id, first_name, last_name, email, role;
      `,
      [first_name, last_name, email, hashedPassword]
    );

    const token = generateToken(result.rows[0]);

    res.status(201).json({
      message: "Registracija organizatorja uspešna!",
      token,
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Napaka pri registraciji organizatorja:", err);
    next(err);
  }
});

/* --------------------------------------
    Organizer Login
-------------------------------------- */
router.post("/organizer-login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "E-pošta in geslo sta obvezna!"
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'organizer'",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Napačna e-pošta ali geslo, ali niste organizator!"
      });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Napačna e-pošta ali geslo!"
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Prijava organizatorja uspešna!",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Napaka pri prijavi organizatorja:", err);
    next(err);
  }
});

/* --------------------------------------
    Get all users (optional role filter)
-------------------------------------- */
router.get("/", async (req, res, next) => {
  const { role } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      ${role ? "WHERE role = $1" : ""}
      ORDER BY created_at DESC;
      `,
      role ? [role] : []
    );

    res.status(200).json({
      message: role ? `Najdeni uporabniki z vlogo '${role}'.` : "Najdeni vsi uporabniki.",
      users: result.rows
    });
  } catch (err) {
    console.error("Napaka pri GET /users:", err);
    next(err);
  }
});

/* --------------------------------------
    Get user by ID (with counts)
-------------------------------------- */
router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Uporabnik z ID ${id} ne obstaja.` });
    }

    const counts = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = $1) AS event_count,
        (SELECT COUNT(*) FROM transactions WHERE user_id = $1) AS transaction_count,
        (SELECT COUNT(*) FROM tickets WHERE user_id = $1) AS ticket_count,
        (SELECT COUNT(*) FROM waitlist WHERE user_id = $1) AS waitlist_count;
      `,
      [id]
    );

    res.status(200).json({
      user: result.rows[0],
      related_counts: counts.rows[0]
    });
  } catch (err) {
    console.error("Napaka pri GET /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
    Add user (admin only - optional)
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Manjkajo podatki!"
    });
  }

  const validRoles = ["user", "organizer", "admin"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      message: `Neveljavna vloga '${role}'.`
    });
  }

  try {
    const check = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        message: "Uporabnik s tem e-naslovom že obstaja!"
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, COALESCE($5,'user')::user_role)
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [first_name, last_name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "Uporabnik uspešno dodan!",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Napaka pri POST /users:", err);
    next(err);
  }
});

/* --------------------------------------
    Delete user
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    const check = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "Uporabnik ni bil najden!"
      });
    }

    const rel = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = $1) AS event_count,
        (SELECT COUNT(*) FROM transactions WHERE user_id = $1) AS transaction_count,
        (SELECT COUNT(*) FROM tickets WHERE user_id = $1 OR owner_id = $1) AS ticket_count,
        (SELECT COUNT(*) FROM waitlist WHERE user_id = $1) AS waitlist_count;
      `,
      [id]
    );

    const { event_count, transaction_count, ticket_count, waitlist_count } = rel.rows[0];

    if (
      parseInt(event_count) > 0 ||
      parseInt(transaction_count) > 0 ||
      parseInt(ticket_count) > 0 ||
      parseInt(waitlist_count) > 0
    ) {
      return res.status(400).json({
        message: "Uporabnika ni mogoče izbrisati - ima povezane zapise.",
        relations: rel.rows[0]
      });
    }

    const deleted = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [id]
    );

    res.status(200).json({
      message: "Uporabnik uspešno izbrisan!",
      deleted: deleted.rows[0]
    });
  } catch (err) {
    console.error("Napaka pri DELETE /users/:id:", err);
    next(err);
  }
});

export default router;
