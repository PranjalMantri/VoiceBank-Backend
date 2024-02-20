import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import {
  SAVINGS_ACCOUNT_INTEREST_RATE,
  CURRENT_ACCOUNT_INTEREST_RATE,
  SALARY_ACCOUNT_INTEREST_RATE,
} from "../constants.js";
import { Loan } from "../models/loan.model.js";

const createLoan = asyncHandler(async (req, res) => {
  const { amount, purpose } = req.body;

  if (!amount) {
    throw new ApiError(400, "Amount is required");
  }

  if (!purpose) {
    throw new ApiError(400, "Purpose is required");
  }

  // getting the balance and accountType of user
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

  // calculating interestRate based on the accountType
  let interestRate;

  if (account.type === "salary") {
    interestRate = SALARY_ACCOUNT_INTEREST_RATE;
  } else if (account.type === "savings") {
    interestRate = SAVINGS_ACCOUNT_INTEREST_RATE;
  } else {
    interestRate = CURRENT_ACCOUNT_INTEREST_RATE;
  }

  // If user already has a approved loan, it cannot get another loan
  const alreadyHasApprovedLoans = await Loan.findOne({
    account: account._id,
    status: "APPROVED",
  });

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

  // approving the loan if criteria is met
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

const getLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  if (!isValidObjectId(loanId)) {
    throw new ApiError(404, "Invalid loan Id");
  }

  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new ApiError(404, "Loan does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, loan, "Fetched loan from Id successfuly"));
});

// const updateLoan = asyncHandler(async (req, res) => {});

const deleteLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  if (!isValidObjectId(loanId)) {
    throw new ApiError(404, "Invalid loan Id");
  }

  const loan = await Loan.findByIdAndDelete(loanId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deletd loan successfuly"));
});

export { createLoan, getLoan, deleteLoan };
