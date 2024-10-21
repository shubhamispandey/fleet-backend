import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
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
    { expiresIn: "10m" }
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

export const formattedDate = (
  time,
  lang = "en-IN",
  options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // AM/PM format
  }
) => new Date(time).toLocaleString(lang, options);

export const generateMeetingCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const length = 12;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};
