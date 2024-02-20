import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error ", error);
    });

    app.listen(port, () => {});
  })
  .catch((err) => {
    console.log("MongoDB connection Error: ", err);
  });
