// src/routes/users.js
import express from "express";
import pool from "../db.js";
import { hashPassword, comparePassword, generateToken, generateRefreshToken, verifyToken } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { validateId, validateEmail, validatePassword, validateString, sanitizeBody } from "../middleware/validation.js";
import { userExists, getUserById } from "../utils/dbHelpers.js";

const router = express.Router();

// Apply sanitization middleware to all POST/PUT routes
router.use(sanitizeBody);

/* --------------------------------------
    User Registration (normal + organizer)
-------------------------------------- */
router.post("/register", async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  // Validate first name
  const firstNameValidation = validateString(first_name, 'First name', 1, 50);
  if (!firstNameValidation.valid) {
    return res.status(400).json({ message: firstNameValidation.message });
  }

  // Validate last name
  const lastNameValidation = validateString(last_name, 'Last name', 1, 50);
  if (!lastNameValidation.valid) {
    return res.status(400).json({ message: lastNameValidation.message });
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.message });
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailValidation.value || email]
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
        message: `Invalid role '${role}'. Allowed roles are: ${allowedRoles.join(", ")}.`
      });
    }

    const hashedPassword = await hashPassword(password);

    // Insert user with sanitized data
    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'user')::user_role)
      RETURNING id, first_name, last_name, email, role;
      `,
      [
        firstNameValidation.value,
        lastNameValidation.value,
        emailValidation.value || email,
        hashedPassword,
        role
      ]
    );

    const token = generateToken(result.rows[0]);
    const refreshToken = generateRefreshToken(result.rows[0]);

    res.status(201).json({
      message: "Registration successful!",
      token,
      refreshToken,
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Error in registration:", err);
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
      message: "Email and password are required!"
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Incorrect email or password!"
      });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Incorrect email or password!"
      });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: "Login successful!",
      token,
      refreshToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error in login:", err);
    next(err);
  }
});

/* --------------------------------------
    Organizer Registration (direct)
-------------------------------------- */
router.post("/organizer-register", async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  // Validate all fields
  const firstNameValidation = validateString(first_name, 'First name', 1, 50);
  if (!firstNameValidation.valid) {
    return res.status(400).json({ message: firstNameValidation.message });
  }

  const lastNameValidation = validateString(last_name, 'Last name', 1, 50);
  if (!lastNameValidation.valid) {
    return res.status(400).json({ message: lastNameValidation.message });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.message });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailValidation.value || email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "User with this email already exists!"
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, 'organizer'::user_role)
      RETURNING id, first_name, last_name, email, role;
      `,
      [
        firstNameValidation.value,
        lastNameValidation.value,
        emailValidation.value || email,
        hashedPassword
      ]
    );

    const token = generateToken(result.rows[0]);
    const refreshToken = generateRefreshToken(result.rows[0]);

    res.status(201).json({
      message: "Organizer registration successful!",
      token,
      refreshToken,
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Error in organizer registration:", err);
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
      message: "Email and password are required!"
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'organizer'",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Incorrect email or password, or you are not an organizer!"
      });
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Incorrect email or password!"
      });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: "Organizer login successful!",
      token,
      refreshToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Error in organizer login:", err);
    next(err);
  }
});

/* --------------------------------------
    Get all users (PROTECTED - optional role filter)
-------------------------------------- */
router.get("/", requireAuth, async (req, res, next) => {
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
      message: role ? `Users with role '${role}' found.` : "All users found.",
      users: result.rows
    });
  } catch (err) {
    console.error("Error in GET /users:", err);
    next(err);
  }
});

/* --------------------------------------
    Get user by ID (PROTECTED - Own profile only)
-------------------------------------- */
router.get("/:id", requireAuth, validateId('id'), async (req, res, next) => {
  const id = req.params.id; // Already validated and converted to number

  // Verify user is accessing their own profile
  if (req.user.id !== id) {
    return res.status(403).json({ message: "You can only access your own profile!" });
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
      return res.status(404).json({ message: `User with ID ${id} does not exist.` });
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
    console.error("Error in GET /users/:id:", err);
    next(err);
  }
});

/* --------------------------------------
    Add user (PROTECTED - admin only)
-------------------------------------- */
router.post("/", requireAuth, async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  // Validate all fields
  const firstNameValidation = validateString(first_name, 'First name', 1, 50);
  if (!firstNameValidation.valid) {
    return res.status(400).json({ message: firstNameValidation.message });
  }

  const lastNameValidation = validateString(last_name, 'Last name', 1, 50);
  if (!lastNameValidation.valid) {
    return res.status(400).json({ message: lastNameValidation.message });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.message });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  const validRoles = ["user", "organizer", "admin"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({
      message: `Invalid role '${role}'.`
    });
  }

  try {
    const check = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [emailValidation.value || email]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        message: "User with this email already exists!"
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ($1, $2, $3, $4, COALESCE($5,'user')::user_role)
      RETURNING id, first_name, last_name, email, role, created_at;
      `,
      [
        firstNameValidation.value,
        lastNameValidation.value,
        emailValidation.value || email,
        hashedPassword,
        role
      ]
    );

    res.status(201).json({
      message: "User successfully added!",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Error in POST /users:", err);
    next(err);
  }
});

/* --------------------------------------
    Refresh Token Endpoint
-------------------------------------- */
router.post("/refresh-token", async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is required"
    });
  }

  try {
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    // Get fresh user data
    const result = await pool.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const user = result.rows[0];
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: "Token refreshed successfully",
      token: newToken,
      refreshToken: newRefreshToken,
      user
    });
  } catch (err) {
    console.error("Error refreshing token:", err);
    return res.status(401).json({
      message: err.message || "Invalid or expired refresh token"
    });
  }
});

/* --------------------------------------
    Delete user (PROTECTED - Own account only)
-------------------------------------- */
router.delete("/:id", requireAuth, validateId('id'), async (req, res, next) => {
  const id = req.params.id; // Already validated

  // Verify user is deleting their own account
  if (req.user.id !== id) {
    return res.status(403).json({ message: "You can only delete your own account!" });
  }

  try {
    const check = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        message: "User not found!"
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
        message: "Cannot delete user - has related records.",
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
      message: "User successfully deleted!",
      deleted: deleted.rows[0]
    });
  } catch (err) {
    console.error("Error in DELETE /users/:id:", err);
    next(err);
  }
});

export default router;
