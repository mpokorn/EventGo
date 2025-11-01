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
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      ${role ? "WHERE role = $1" : ""}
      ORDER BY created_at DESC;
      `,
      role ? [role] : []
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: "Ni najdenih uporabnikov.", users: [] });
    }

    res.status(200).json({
      message: role ? `Najdeni uporabniki z vlogo '${role}'.` : "Najdeni vsi uporabniki.",
      users: result.rows,
    });
  } catch (err) {
    console.error("❌ Napaka pri GET /users:", err);
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
      SELECT id, first_name, last_name, email, role, created_at
      FROM users
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Uporabnik z ID ${id} ne obstaja.` });
    }

    // Optional: get some summary info (counts)
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
      related_counts: counts.rows[0],
    });
  } catch (err) {
    console.error("❌ Napaka pri GET /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Add new user
-------------------------------------- */
router.post("/", async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  // ✅ Basic field validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Manjkajo potrebni podatki za dodajanje uporabnika!",
    });
  }

  // ✅ Allowed roles based on your user_role enum
  const validRoles = ["user", "organizer", "admin"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      message: `Neveljavna vloga '${role}'. Dovoljene vloge so: ${validRoles.join(", ")}.`,
    });
  }

  try {
    // ✅ Check for duplicate email
    const emailCheck = await pool.query(`SELECT id FROM users WHERE email = $1;`, [email]);
    if (emailCheck.rowCount > 0) {
      return res.status(400).json({ message: "Uporabnik s tem e-naslovom že obstaja!" });
    }

    // ⚠️ In production, hash the password (for now plain-text)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert safely with enum casting
    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'user')::user_role)
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [first_name, last_name, email, password, role]
    );

    res.status(201).json({
      message: "Uporabnik uspešno dodan!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Napaka pri POST /users:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Update user
-------------------------------------- */
router.put("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, email, password, role } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    // Prevent duplicate email conflicts
    if (email) {
      const emailCheck = await pool.query(
        `SELECT id FROM users WHERE email = $1 AND id <> $2;`,
        [email, id]
      );
      if (emailCheck.rowCount > 0) {
        return res
          .status(400)
          .json({ message: "Ta e-naslov je že v uporabi pri drugem uporabniku!" });
      }
    }

    const result = await pool.query(
      `
      UPDATE users
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        password = COALESCE($4, password),
        role = COALESCE($5, role)
      WHERE id = $6
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [first_name, last_name, email, password, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Uporabnik ni bil najden!" });
    }

    res.status(200).json({
      message: "Uporabnik uspešno posodobljen!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Napaka pri PUT /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
   🟢 Delete user (with relational checks)
-------------------------------------- */
router.delete("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID mora biti število." });
  }

  try {
    // ✅ Check if user exists
    const userCheck = await pool.query(`SELECT id, first_name, last_name FROM users WHERE id = $1;`, [id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: "Uporabnik ni bil najden!" });
    }

    // ✅ Check linked records
    const relCheck = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM events WHERE organizer_id = $1) AS event_count,
        (SELECT COUNT(*) FROM transactions WHERE user_id = $1) AS transaction_count,
        (SELECT COUNT(*) FROM tickets WHERE user_id = $1 OR owner_id = $1) AS ticket_count,
        (SELECT COUNT(*) FROM waitlist WHERE user_id = $1) AS waitlist_count;
      `,
      [id]
    );

    const { event_count, transaction_count, ticket_count, waitlist_count } = relCheck.rows[0];

    if (
      parseInt(event_count) > 0 ||
      parseInt(transaction_count) > 0 ||
      parseInt(ticket_count) > 0 ||
      parseInt(waitlist_count) > 0
    ) {
      return res.status(400).json({
        message:
          "Uporabnika ni mogoče izbrisati, ker ima povezane dogodke, transakcije, vozovnice ali čakalno listo.",
        relations: relCheck.rows[0],
      });
    }

    // ✅ Safe to delete
    const result = await pool.query(
      `
      DELETE FROM users 
      WHERE id = $1 
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [id]
    );

    res.status(200).json({
      message: "Uporabnik uspešno izbrisan!",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Napaka pri DELETE /users/:id:", err);
    next(err);
  }
});

export default router;
