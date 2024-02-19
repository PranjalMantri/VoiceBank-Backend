import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      // Deposit, Withdrawl, Transfer
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fromAccount: {
      type: Number,
    },
    toAccount: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
