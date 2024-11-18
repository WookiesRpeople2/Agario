import express from "express";
import { apiConfig } from "./config";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.listen(apiConfig.ports.appPort, () => {
  console.log(
    `server is up and running and connected to the DB on port ${apiConfig.ports.appPort}`
  );
});
