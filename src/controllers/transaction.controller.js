import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, toAccount, pin } = req.body;

  if (!amount) {
    throw new ApiError(404, "amount is required");
  }

  if (!pin) {
    throw new ApiError(404, "Pin is required");
  }

  if (!toAccount) {
    throw new ApiError(404, "toAccount is required");
  }

  const senderUser = await User.findById(req.user._id);

  if (!senderUser) {
    throw new ApiError(404, "User does not exist");
  }

  const senderAccount = await Account.findOne({
    owner: senderUser._id,
  });

  if (!senderAccount) {
    throw new ApiError(404, "Sender does not exist");
  }

  const receiverAccount = await Account.findOne({
    accountNumber: toAccount,
  });

  if (!receiverAccount) {
    throw new ApiError(404, "receiver does not exist");
  }

  const isPinValid = senderAccount.pin == pin;

  if (!isPinValid) {
    throw new ApiError(404, "Invalid pin");
  }

  const isTransactionValid = senderAccount.balance > amount;

  if (!isTransactionValid) {
    throw new ApiError(404, "Insufficient funds to transfer");
  }

  const transaction = await Transaction.create({
    type: "Transfer",
    amount,
    fromAccount: senderAccount.accountNumber,
    toAccount: receiverAccount.accountNumber,
  });

  senderAccount.balance = senderAccount.balance - amount;
  receiverAccount.balance = Number(receiverAccount.balance) + Number(amount);

  senderAccount.save({ validateBeforeSave: false });
  receiverAccount.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transfered funds successfuly"));
});

const createDeposit = asyncHandler(async (req, res) => {
  const { amount, pin } = req.body;

  if (!amount) {
    throw new ApiError(404, "amount is required");
  }

  if (!pin) {
    throw new ApiError(404, "Pin is required");
  }

  const receiverUser = await User.findById(req.user._id);

  if (!receiverUser) {
    throw new ApiError(404, "The receiver does not exist");
  }

  const receiverAccount = await Account.findOne({
    owner: receiverUser._id,
  });

  if (!receiverAccount) {
    throw new ApiError(404, "Receiver does not exist");
  }

  const isPinValid = receiverAccount.pin == pin;

  if (!isPinValid) {
    throw new ApiError(404, "Invalid pin");
  }

  const transaction = await Transaction.create({
    type: "Deposit",
    amount,
    toAccount: receiverAccount.accountNumber,
  });

  receiverAccount.balance = Number(receiverAccount.balance) + Number(amount);
  receiverAccount.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transfered funds successfuly"));
});

const createWithdrawl = asyncHandler(async (req, res) => {
  const { amount, pin } = req.body;

  if (!amount) {
    throw new ApiError(404, "amount is required");
  }

  if (!pin) {
    throw new ApiError(404, "Pin is required");
  }

  const receiverUser = await User.findById(req.user._id);

  if (!receiverUser) {
    throw new ApiError(404, "The receiver does not exist");
  }

  const receiverAccount = await Account.findOne({
    owner: receiverUser._id,
  });

  if (!receiverAccount) {
    throw new ApiError(404, "Receiver does not exist");
  }

  const isPinValid = receiverAccount.pin == pin;

  if (!isPinValid) {
    throw new ApiError(404, "Invalid pin");
  }

  const isTransactionValid = receiverAccount.balance > amount;

  if (!isTransactionValid) {
    throw new ApiError(404, "Insufficient balance");
  }

  const transaction = await Transaction.create({
    type: "Withdrawl",
    amount,
    toAccount: receiverAccount.accountNumber,
  });

  receiverAccount.balance = Number(receiverAccount.balance) - Number(amount);
  receiverAccount.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transfered funds successfuly"));
});

const getTransactionFromId = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  if (!isValidObjectId(transactionId)) {
    throw new ApiError(404, "Invalid transaction Id");
  }

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new ApiError(404, "Transaction does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transaction,
        "Successfully fetched transaction from Id"
      )
    );
});

const getTotalTransactionOfAccount = asyncHandler(async (req, res) => {
  const { acountId } = req.params;

  if (!isValidObjectId) {
    throw new ApiError(404, "Invalid Transaction Id");
  }
});

const getTransactionsByType = asyncHandler(async (req, res) => {});

const getTransactionCount = asyncHandler(async (req, res) => {});

export {
  createTransaction,
  createDeposit,
  createWithdrawl,
  getTransactionFromId,
  getTotalTransactionOfAccount,
  getTransactionsByType,
  getTransactionCount,
};
