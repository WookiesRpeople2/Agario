import express from "express";
import { apiConfig } from "./config";
import mongoose from "mongoose";
import { userRouter } from "./routes/users";
import { createServer, Server as HTTPServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "./types";
import { socketAuthMiddleware } from "./middlewares/auth";
import { SocketRoute } from "./routes/socket";

const app = express();
const server: HTTPServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents
>(server, {
  cors: apiConfig.cors,
});
app.use(express.json());
app.use(cors(apiConfig.cors));
io.use(socketAuthMiddleware);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/auth", userRouter);
SocketRoute(io);

mongoose.connect(apiConfig.db.mongoUrl).then(() => {
  app.listen(apiConfig.ports.appPort, () => {
    console.log(
      "server is up and running and connected to the DB on port ",
      apiConfig.ports.appPort
    );
  });
  server.listen(apiConfig.ports.wsPort, () => {
    console.log(
      "Server and Socket.IO are up and running on port",
      apiConfig.ports.wsPort
    );
  });
});
