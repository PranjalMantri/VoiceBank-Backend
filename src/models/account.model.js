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
    pin: {
      type: Number,
      required: true,
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

export const Account = mongoose.model("Account", accoutSchema);
