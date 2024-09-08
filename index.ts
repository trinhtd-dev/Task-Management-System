import express, { Express, Request, Response } from 'express';

import dotenv from 'dotenv';
import cors from "cors";

import connectDB from "./config/database";
import apiV1 from "./api/v1/routes/index.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());

app.use(express.json());

apiV1(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});