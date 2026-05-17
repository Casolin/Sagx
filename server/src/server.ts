import app from "./app.js";
import connectDB from "./config/db.js";
import dns from "dns";
import http from "http";
import { Server } from "socket.io";

import { initAppSocket } from "./sockets/app.socket.js";
import { initSocket } from "./sockets/socket.service.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// ========================
// SOCKET SERVER
// ========================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);
initAppSocket(io);

const serverConnect = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
};

serverConnect();
