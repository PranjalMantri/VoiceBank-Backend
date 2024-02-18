import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

export const Loan = mongoose.model("Loan", loanSchema);
