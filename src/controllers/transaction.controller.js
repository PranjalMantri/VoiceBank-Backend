import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";

const createTransaction = asyncHandler(async (req, res) => {
  //TODO: create transaction
  // get transaction type, amount, accountFrom, toAccount
  // validate data
  // for deposit and withdrawl -> toAccount can only be user's account
  // for transfer and withdrawl -> check whether there is sufficient balance
  // create a transaction object
});

const getTransactionFromId = asyncHandler(async (req, res) => {
  //TODO: get transaction
});

const getTotalTransactionOfAccount = asyncHandler(async (req, res) => {});

const getTransactionsByType = asyncHandler(async (req, res) => {});

const getTransactionCount = asyncHandler(async (req, res) => {});

export {
  createTransaction,
  getTransactionFromId,
  getTotalTransactionOfAccount,
  getTransactionsByType,
  getTransactionCount,
};
