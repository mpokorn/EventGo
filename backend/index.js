import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import eventsRouter from "./routes/events.js"; // 
import ticketTypesRouter from "./routes/ticketTypes.js"; //
import usersRouter from "./routes/users.js";
import ticketsRouter from "./routes/tickets.js"; //
import transactionsRouter from "./routes/transactions.js";
import waitlistRouter from "./routes/waitlist.js";  



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // 2. Tukaj pod to vrstico prilepi spodnji del

// 3. Poveži events rute
app.use("/events", eventsRouter);
app.use("/ticket-types", ticketTypesRouter);
app.use("/users", usersRouter);
app.use("/tickets", ticketsRouter);
app.use("/transactions", transactionsRouter);
app.use("/waitlist", waitlistRouter);





// test route
app.get("/", (req, res) => {
  res.json({ message: "EventGo API deluje" });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server teče na portu ${PORT}`));
