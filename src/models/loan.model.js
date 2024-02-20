import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    status: {
      // APPROVED, REJECTED, PENDING
      type: String,
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    interestRate: {
      // calculate on basis of type of account
      type: Number,
      required: true,
    },
    purpose: {
      // Home loan, gold loan, personal loan
      type: String,
    },
  },
  { timestamps: true }
);

loanSchema.methods.approveLoan = function (balance, amount) {
  // balance has to be atleast half of the loan amount
  return balance * 2 >= amount;
};

export const Loan = mongoose.model("Loan", loanSchema);
