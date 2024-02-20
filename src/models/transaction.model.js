import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: {
      // Transfer, Deposit, Withdrawl
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fromAccount: {
      // The current user's accountNumber
      type: Number,
    },
    toAccount: {
      // The reciever's accountNumber
      type: Number,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
