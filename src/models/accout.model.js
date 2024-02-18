import mongoose from "mongoose";

const accoutSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accountType: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      default: 1000,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transactions",
      },
    ],
  },
  { timestamps: true }
);

export const Accout = mongoose.model("Account", accoutSchema);