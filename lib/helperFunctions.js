import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const responseFormat = ({
  message = "Something went wrong",
  data = null,
  status = 500,
  ...rest
}) => ({
  message,
  status,
  data,
  ...rest,
});

// Function to generate an access token (JWT)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Function to generate a refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_REFRESH,
    { expiresIn: "7d" }
  );
};
