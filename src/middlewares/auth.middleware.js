import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // get access token either from cookies or header
    console.log("getting tokens");
    console.log("Cookies", req.cookies);

    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("checking tokens");
    if (!token) {
      console.log("Could not find access tokens");
      throw new ApiError(404, "Unauthorized request dfkgjdfljbg");
    }

    // decode the token to get user information
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(500, "Something went wrong while decoding tokens");
    }

    // find the user from the decoded information
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(400, "User does not exist");
    }

    // set the user information to req object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token");
  }
});

export { verifyJWT };
