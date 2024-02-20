import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";

const createTransaction = asyncHandler(async (req, res) => {
  const { amount, toAccount, pin } = req.body;

  if (!amount) {
    throw new ApiError(400, "amount is required");
  }

  if (!pin) {
    throw new ApiError(400, "Pin is required");
  }

  if (!toAccount) {
    throw new ApiError(400, "toAccount is required");
  }

  // Logged in user is the one who is sending money
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
    throw new ApiError(400, "Invalid pin");
  }

  const isTransactionValid = senderAccount.balance > amount;

  if (!isTransactionValid) {
    throw new ApiError(400, "Insufficient funds to transfer");
  }

  const transaction = await Transaction.create({
    type: "Transfer",
    amount,
    fromAccount: senderAccount.accountNumber,
    toAccount: receiverAccount.accountNumber,
  });

  // Updating the balance after the transaction
  senderAccount.balance = senderAccount.balance - amount;
  receiverAccount.balance = Number(receiverAccount.balance) + Number(amount);

  // adding the transaction in the transaction array of account Schema
  senderAccount.transactions.push(transaction);
  receiverAccount.transactions.push(transaction);

  receiverAccount.save({ validateBeforeSave: false });
  senderAccount.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transfered funds successfuly"));
});

const createDeposit = asyncHandler(async (req, res) => {
  const { amount, pin } = req.body;

  if (!amount) {
    throw new ApiError(400, "Amount is required");
  }

  if (!pin) {
    throw new ApiError(400, "Pin is required");
  }

  // While depositing, the logged in user will recieve the money
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

  // Logged in user's pin
  const isPinValid = receiverAccount.pin == pin;

  if (!isPinValid) {
    throw new ApiError(400, "Invalid pin");
  }

  const transaction = await Transaction.create({
    type: "Deposit",
    amount,
    toAccount: receiverAccount.accountNumber,
  });

  // Updating the balance and adding the transaction into transaction array in Account Schema
  receiverAccount.balance = Number(receiverAccount.balance) + Number(amount);
  receiverAccount.transactions.push(transaction);
  receiverAccount.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, transaction, "Transfered funds successfuly"));
});

const createWithdrawl = asyncHandler(async (req, res) => {
  const { amount, pin } = req.body;

  if (!amount) {
    throw new ApiError(400, "amount is required");
  }

  if (!pin) {
    throw new ApiError(400, "Pin is required");
  }

  // Logged in user is withdrawing money
  const withdrawingUser = await User.findById(req.user._id);

  if (!withdrawingUser) {
    throw new ApiError(404, "The receiver does not exist");
  }

  const withdrawingAccount = await Account.findOne({
    owner: withdrawingUser._id,
  });

  if (!withdrawingAccount) {
    throw new ApiError(404, "Receiver does not have a account");
  }

  // Logged in user's pin
  const isPinValid = withdrawingAccount.pin == pin;

  if (!isPinValid) {
    throw new ApiError(400, "Invalid pin");
  }

  const isTransactionValid = withdrawingAccount.balance > amount;

  if (!isTransactionValid) {
    throw new ApiError(400, "Insufficient balance");
  }

  const transaction = await Transaction.create({
    type: "Withdrawl",
    amount,
    toAccount: withdrawingAccount.accountNumber,
  });

  // updating the balance and adding the transaction in transaction array of Account Schema
  withdrawingAccount.balance =
    Number(withdrawingAccount.balance) - Number(amount);
  withdrawingAccount.transactions.push(transaction);
  withdrawingAccount.save({ validateBeforeSave: false });

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
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid Transaction Id");
  }

  const account = await Account.findById(accountId);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  // getting the transaction array that contains transaction ids
  const transactionIds = account.transactions;

  if (!transactionIds) {
    throw new ApiError(401, "The account has no transactions");
  }

  // populating the array based on the ids inside
  const transactions = await Transaction.aggregate([
    {
      $match: {
        _id: {
          $in: transactionIds,
        },
      },
    },
  ]);

  if (!transactions) {
    throw new ApiError(
      500,
      "Something went wrong while getting account's transactions"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, transactions, "Fetched all transaction successfuly")
    );
});

const getTransactionsByType = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid Transaction Id");
  }

  const account = await Account.findById(accountId);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  // getting the transaction ids
  const transactionIds = account.transactions;

  if (!transactionIds) {
    throw new ApiError(401, "The account has no transactions");
  }

  // getting all the transaction of type "Transfer"
  const transfers = await Transaction.aggregate([
    {
      $match: {
        _id: {
          $in: transactionIds,
        },
      },
    },
    {
      $match: {
        type: "Transfer",
      },
    },
  ]);

  // getting all the transaction of type "Deposit"
  const deposits = await Transaction.aggregate([
    {
      $match: {
        _id: {
          $in: transactionIds,
        },
      },
    },
    {
      $match: {
        type: "Deposit",
      },
    },
  ]);

  // getting all the transaction of type "Withdrawl"
  const withdrawls = await Transaction.aggregate([
    {
      $match: {
        _id: {
          $in: transactionIds,
        },
      },
    },
    {
      $match: {
        type: "Withdrawl",
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transfers,
        deposits,
        withdrawls,
      },
      "Fetched all transaction successfuly"
    )
  );
});

const getTransactionCount = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid Transaction Id");
  }

  // returns a new field that contains the count of all transactions
  const account = await Account.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(accountId),
      },
    },
    {
      $addFields: {
        transactionCount: {
          $size: "$transactions",
        },
      },
    },
    {
      $project: {
        _id: 0,
        transactionCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        account,
        "Successfuly fetched the number of transactions"
      )
    );
});

export {
  createTransaction,
  createDeposit,
  createWithdrawl,
  getTransactionFromId,
  getTotalTransactionOfAccount,
  getTransactionsByType,
  getTransactionCount,
};
