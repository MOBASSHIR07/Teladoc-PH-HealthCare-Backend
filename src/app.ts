import express, { Application, Request, Response } from "express";
import { IndexRoute } from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";
import { envVars } from "./config/env";
import qs from "qs";
import { PaymentController } from "./app/modules/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/modules/appointment/appointment.service";

const app: Application = express()
app.set("query parser", (str:string)=>qs.parse(str));

app.set('view engine', 'ejs');
app.set('views',path.resolve(process.cwd(), `src/app/templates`));
app.post("/webhook", express.raw({ type: "application/json" }), 
     PaymentController.handleWebHookEvent
);
app.use(cors(
  {
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }

))
app.use(express.json());
//vfor form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

 app.use("/api/auth", toNodeHandler(auth))

// Enable URL-encoded form data parsing
// app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies



cron.schedule('*/25 * * * *', async () => {
  await AppointmentService.cancelUnpaidAppointments();
});

app.use('/api/v1', IndexRoute);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});
app.use(globalErrorHandler);
app.use(notFound)

export default app