import mongoose, { connect } from "mongoose";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();

connectDB();
