import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../lib/sendMail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  responseFormat,
} from "../lib/helperFunctions.js";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import Token from "../models/Token.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(403)
        .json({ message: "Invalid email or password", status: 403 });
    }

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(403)
        .json({ message: "Invalid email or password", status: 403 });
    }

    // Generate access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the refresh token in the database
    await Token.create({ userId: user._id, refreshToken });

    // Send the tokens in the response
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Ensure tokens can't be accessed via JavaScript
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      data: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        accessToken,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: 500 });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, avatar } = req.body;

    if (!name || !email || !password || !confirmPassword || !avatar)
      return res.status(400).json(
        responseFormat({
          message: "All fields are required",
          status: 400,
          data: null,
        })
      );

    if (!validator.isEmail(email)) {
      return res.status(400).json(
        responseFormat({
          message: "Invalid email",
          status: 400,
          data: null,
        })
      );
    }

    if (password != confirmPassword)
      return res.status(400).json(
        responseFormat({
          message: "Passwords do not match",
          status: 400,
          data: null,
        })
      );

    const user = await User.findOne({ email });
    if (user)
      return res.status(409).json(
        responseFormat({
          message: "User already exists",
          status: 409,
          data: null,
        })
      );

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    });

    const mailRes = await sendMail(newUser);
    if (mailRes.status !== 200) {
      console.log("Couldn't send email verification");
      await User.findOneAndDelete({ email });
      return res
        .status(500)
        .json(responseFormat({ message: "Couldn't send email verification" }));
    }

    return res.status(201).json(
      responseFormat({
        message: "User registered successfully, Please verify your account",
        status: 201,
        data: {
          name,
          email,
          avatar: newUser.avatar,
          isVerified: newUser.isVerified,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseFormat({}));
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json(
        responseFormat({
          message: "Invalid email format",
          status: 400,
        })
      );
    }

    // Check if user exists
    const userInDb = await User.findOne({ email });
    if (!userInDb) {
      return res.status(404).json(
        responseFormat({
          message: "User not found",
          status: 404,
        })
      );
    }

    // Check if the user is already verified
    if (userInDb.isVerified) {
      return res.status(400).json(
        responseFormat({
          message: "User is already verified, please login",
          status: 400,
        })
      );
    }

    // Find OTP associated with the user
    const otpInDb = await Otp.findOne({ userId: userInDb._id });
    if (!otpInDb) {
      // Send a new OTP if none exists in the database
      const mailRes = await sendMail(userInDb);
      return mailRes.status === 200
        ? res.status(400).json(
            responseFormat({
              message:
                "Invalid OTP, a new OTP has been sent to your email. Please try again",
              status: 400,
            })
          )
        : res.status(500).json(
            responseFormat({
              message: "Failed to send OTP. Please try again",
              status: 500,
            })
          );
    }

    // Check if the provided OTP matches and is not expired
    if (otp === otpInDb.otp) {
      if (otpInDb.expiresAt > Date.now()) {
        // OTP is valid and not expired
        await Otp.findOneAndDelete({ userId: otpInDb.userId });
        await User.findOneAndUpdate(
          { _id: otpInDb.userId },
          { isVerified: true }
        );
        return res.status(200).json(
          responseFormat({
            message:
              "User verification successful. Please login to your account.",
            status: 200,
          })
        );
      } else {
        // OTP has expired
        return res.status(400).json(
          responseFormat({
            message: "OTP has expired. Please request a new OTP.",
            status: 400,
          })
        );
      }
    }

    // OTP does not match
    return res.status(400).json(
      responseFormat({
        message: "Invalid OTP",
        status: 400,
      })
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json(
      responseFormat({
        message: "Internal server error",
        status: 500,
      })
    );
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json(
        responseFormat({
          message: "Invalid email format",
          status: 400,
        })
      );
    }

    // Check if user exists and is not verified
    const userInDb = await User.findOne({ email });
    if (!userInDb) {
      return res.status(404).json(
        responseFormat({
          message: "User not found",
          status: 404,
        })
      );
    }

    if (userInDb.isVerified) {
      return res.status(400).json(
        responseFormat({
          message: "User is already verified, please login",
          status: 400,
        })
      );
    }

    // Remove existing OTP and send a new one
    await Otp.deleteMany({ userId: userInDb._id });

    const mailRes = await sendMail(userInDb);
    if (mailRes.status !== 200) {
      return res.status(500).json(
        responseFormat({
          message: "Failed to send OTP. Please try again",
          status: 500,
        })
      );
    }

    return res.status(200).json(
      responseFormat({
        message: "A new OTP has been sent to your email",
        status: 200,
      })
    );
  } catch (error) {
    console.error("Error Resending OTP:", error);
    return res.status(500).json(
      responseFormat({
        message: "Internal server error",
        status: 500,
      })
    );
  }
};

export const getUser = async (req, res) => {
  try {
    // Extract the access token from cookies
    const refreshToken = req.cookies?.refreshToken;

    // Check if the token exists
    if (!refreshToken) {
      return res.status(401).json(
        responseFormat({
          data: null,
          message: "Refresh token is missing",
          status: 401,
        })
      );
    }

    // Verify and decode the token
    const decryptedRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH
    );

    // Extract the user's email from the decoded token
    const { email } = decryptedRefreshToken;

    if (!email) {
      return res.status(400).json(
        responseFormat({
          data: null,
          message: "Invalid token: email not found",
          status: 400,
        })
      );
    }

    // Fetch the user by email from the database
    const user = await User.findOne({ email });

    // If the user is not found
    if (!user) {
      return res.status(404).json(
        responseFormat({
          data: null,
          message: "User not found",
          status: 404,
        })
      );
    }

    // If the user is found, return the user data
    return res.status(200).json(
      responseFormat({
        data: user,
        message: "User found",
        status: 200,
      })
    );
  } catch (error) {
    console.error("Error fetching user:", error);

    // Handle different error cases
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(
        responseFormat({
          data: null,
          message: "Invalid access token",
          status: 401,
        })
      );
    }

    // Internal server error
    return res.status(500).json(
      responseFormat({
        data: null,
        message: "Internal server error",
        status: 500,
      })
    );
  }
};
