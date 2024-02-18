import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    throw new ApiError("Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(500, "Something went wrong while decoding tokens");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  req.user = user;
  next();
});

export { verifyJWT };
