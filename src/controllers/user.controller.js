import { User } from "../models/user.model.js";
import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import cookieParser from "cookie-parser";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // generates access and refresh token
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // saved refresh token in database
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Fullname is required");
  }

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Can't register user if it already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // generates customerId which is simply the number of user
  const customerId = await User.generateCustomerId();

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    customerId,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfuly"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  } else {
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  } else {
  }

  // user login using email Id
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect user credentials");
  }

  // If user credentials are correct, generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send access and refresh tokens that can only be modified by the server

  const options = {
    httpOnly: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfuly"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // delete the refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfuly"));
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfuly fetched user by Id"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullName, username } = req.body;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  if (!fullName) {
    throw new ApiError(400, "Fullname is required");
  }

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
        username,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfuly"));
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!isValidObjectId) {
    throw new ApiError(404, "Invalid ");
  }

  if (!oldPassword) {
    throw new ApiError(400, "Old password is required");
  }

  if (!password) {
    throw new ApiError(400, "New password is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // if oldPassword matches the password in database, update the password with new password
  user.password = password;
  user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User password updated successfuly")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(500, "Something went wrong while deleting user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deleted user successfuly"));
});

const getUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const userAccounts = await Account.find({
    owner: userId,
  });

  if (!userAccounts) {
    throw new ApiError(404, "User has no accounts");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userAccounts, "Fetched user's accounts successfuly")
    );
});

const getUserBalance = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //TODO:  user pipeline to directly return the balance
  const account = await Account.findOne({
    owner: userId,
  });

  if (!account) {
    throw new ApiError(404, "User has no accounts");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { balance: account.balance },
        "Fetched user's accounts successfuly"
      )
    );
});

const getUserTransactions = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(404, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // TODO: Use pipeline to directly return the transactions
  const account = await Account.findOne({
    owner: userId,
  });

  if (!account) {
    throw new ApiError(404, "User has no accounts");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { transactions: account.transactions },
        "Fetched user's accounts successfuly"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  updateUserDetails,
  updateUserPassword,
  deleteUser,
  getUserAccount,
  getUserBalance,
  getUserTransactions,
};
