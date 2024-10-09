import jwt from "jsonwebtoken";
import {
  formattedDate,
  generateAccessToken,
  responseFormat,
} from "../lib/helperFunctions.js";
import User from "../models/User.js";

const authMiddleware = (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;
  const decoded = jwt.decode(accessToken, process.env.JWT_SECRET);
  console.log(formattedDate(decoded.exp * 1000));

  if (!accessToken) {
    return res
      .status(401)
      .json(responseFormat({ message: "Access token missing", status: 401 }));
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError" && refreshToken) {
        // Token expired, check the refresh token
        jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_REFRESH,
          async (err, decodedRefreshToken) => {
            if (err) {
              return res.status(403).json(
                responseFormat({
                  message: "Refresh token invalid",
                  status: 403,
                })
              );
            }

            // Refresh token is valid, generate a new access token
            const user = await User.findOne({
              email: decodedRefreshToken?.email,
            });
            const newAccessToken = generateAccessToken(user);

            res.cookie("accessToken", newAccessToken, { httpOnly: true });
            req.user = decodedRefreshToken;
            next();
          }
        );
      } else {
        return res
          .status(403)
          .json(
            responseFormat({ message: "Access token invalid", status: 403 })
          );
      }
    } else {
      req.user = decoded;
      next();
    }
  });
};

export default authMiddleware;
