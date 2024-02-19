import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import aleaRNGFactory from "number-generator/lib/aleaRNGFactory.js";

const createAccount = asyncHandler(async (req, res) => {
  //TODO: Create user's account
  // Testing for account number using external library

  const { uInt32 } = aleaRNGFactory(5);
  const number = uInt32();
  console.log(number);
});

const getAccount = asyncHandler(async (req, res) => {
  //TODO: get account by accountId
});

const getUserBalance = asyncHandler(async (req, res) => {
  //TODO: get user's balance
});

const getUserTransactions = asyncHandler(async (req, res) => {
  //TODO: get user's transactions
});

export { createAccount, getAccount, getUserBalance, getUserTransactions };
