import { User } from "../models/user.model.js";
import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import {
  SAVINGS_ACCOUNT_INTEREST_RATE,
  CURRENT_ACCOUNT_INTEREST_RATE,
  SALARY_ACCOUNT_INTEREST_RATE,
} from "../constants.js";
import { Loan } from "../models/loan.model.js";

const createLoan = asyncHandler(async (req, res) => {
  const { amount, purpose } = req.body;

  if (!amount) {
    throw new ApiError(404, "Amount is required");
  }

  if (!purpose) {
    throw new ApiError(404, "Purpose is required");
  }

  const account = await Account.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $project: {
        _id: 1,
        balance: 1,
        accountType: 1,
      },
    },
  ]);

  let interestRate;

  if (account.type === "salary") {
    interestRate = SALARY_ACCOUNT_INTEREST_RATE;
  } else if (account.type === "savings") {
    interestRate = SAVINGS_ACCOUNT_INTEREST_RATE;
  } else {
    interestRate = CURRENT_ACCOUNT_INTEREST_RATE;
  }

  const alreadyHasApprovedLoans = await Loan.findOne({
    account: account._id,
    status: "APPROVED",
  });

  console.log(alreadyHasApprovedLoans);

  if (alreadyHasApprovedLoans) {
    throw new ApiError(409, "You already have a loan");
  }

  const loan = await Loan.create({
    amount,
    account: account._id,
    interestRate,
    purpose,
  });

  if (!loan) {
    throw new ApiError(500, "Something went wrong while processing your loan");
  }

  const isLoanApproved = await loan.approveLoan(account[0].balance, amount);

  let status = "APPROVED";
  if (!isLoanApproved) {
    status = "REJECTED";
  }

  loan.status = status;
  loan.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, loan, "Loan request processed successfuly"));
});

const getLoan = asyncHandler(async (req, res) => {});

const updateLoan = asyncHandler(async (req, res) => {});

const deleteLoan = asyncHandler(async (req, res) => {});

export { createLoan, getLoan, updateLoan, deleteLoan };
