import { Account } from "../models/accout.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";

const createAccount = asyncHandler(async (req, res) => {
  //TODO: Create user's account
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
