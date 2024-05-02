import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import aleaRNGFactory from "number-generator/lib/aleaRNGFactory.js";
import mongoose from "mongoose";

const createAccount = asyncHandler(async (req, res) => {
  const { accountType, pin } = req.body;

  if (!accountType) {
    throw new ApiError(400, "Account type is required");
  }

  if (!pin) {
    throw new ApiError(400, "Pin is required");
  }

  // checking if user already has account
  const alreadyHasAccount = await Account.findOne({
    owner: req.user._id,
  });

  if (alreadyHasAccount) {
    throw new ApiError(409, `User already has a account`);
  }

  // generating account number based on the customerId
  const accountNumber = aleaRNGFactory(req.user.customerId).uInt32();

  if (!accountNumber) {
    throw new ApiError(
      500,
      "Something went wrong while generating account number"
    );
  }

  const account = await Account.create({
    owner: req.user._id,
    accountType,
    accountNumber,
    pin,
  });


  if (!account) {
    throw new ApiError(500, "Something went wrong while creating account");
  }

  res.status(200).json(new ApiResponse(200, account, "Created User account"));
});

const getAccount = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid account Id");
  }

  const account = await Account.findById(accountId);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, account, "Successfuly fetched account by id"));
});

const getAccountOwner = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid account Id");
  }

  // getting User's username and customerId from the account
  const account = await Account.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(accountId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 0,
              username: 1,
              customerId: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        username: { $arrayElemAt: ["$owner.username", 0] },
        customerId: { $arrayElemAt: ["$owner.customerId", 0] },
        _id: 0,
      },
    },
  ]);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, account, "Fetched account owner details successfuly")
    );
});

const getAccountBalance = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid accountId");
  }

  //TODO: Use pipeline to directly return balance
  const account = await Account.findById(accountId);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { balance: account.balance },
        "Fetched account's balance successfuly"
      )
    );
});

const getAccountTransactions = asyncHandler(async (req, res) => {
  const { accountId } = req.params;

  if (!isValidObjectId(accountId)) {
    throw new ApiError(404, "Invalid accountId");
  }

  //TODO: Use pipeline to directly return transactions
  const account = await Account.findById(accountId);

  if (!account) {
    throw new ApiError(404, "Account does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { transactions: account.transactions },
        "Fetched account's balance successfuly"
      )
    );
});

export {
  createAccount,
  getAccount,
  getAccountOwner,
  getAccountBalance,
  getAccountTransactions,
};
