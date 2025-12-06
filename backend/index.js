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
  res.json({ message: "EventGo API is working" });
});



const PORT = process.env.PORT || 5000;

// Get network IP addresses
import { networkInterfaces } from 'os';
const getNetworkIPs = () => {
  const nets = networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
};

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  
  const networkIPs = getNetworkIPs();
  if (networkIPs.length > 0) {
    networkIPs.forEach(ip => {
      console.log(`Network: http://${ip}:${PORT}`);
    });
  }
});
