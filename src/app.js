import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(cookieParser());

// importing routers
import userRouter from "./routes/user.routes.js";
import accountRouter from "./routes/accout.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/transaction", transactionRouter);

export default app;
