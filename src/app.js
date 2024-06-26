import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500/",
      "http://localhost:5500/",
      "http://localhost:5500/home.html",
    ],
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
import loanRouter from "./routes/loan.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/loan", loanRouter);

export default app;
