import express, { Application, Request, Response } from "express";
import { IndexRoute } from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import cors from "cors";

const app: Application = express()
app.use(cors(
  {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
  }

))
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())

app.use('/api/v1', IndexRoute);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});
app.use(globalErrorHandler);
app.use(notFound)

export default app