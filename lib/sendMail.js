import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.USEREMAILPASSWORD,
  },
});

const generateOTP = (n = 6) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

const sendMail = async (user) => {
  try {
    if (!process.env.USEREMAIL || !process.env.USEREMAILPASSWORD)
      throw new Error("Email credentials are not set in Environment variables");

    const otp = generateOTP();
    await Otp.create({
      userId: user._id,
      otp,
    });

    const htmlContent = `
      <div style="background-color: #f9fafb; padding: 20px; font-family: sans-serif;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <h2 style="font-size: 24px; font-weight: bold; color: #111827;">Welcome to Fleet Registration!</h2>
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 30px;">You're almost there! Use the following One-Time Password (OTP) to complete your account registration.</p>
          <div style="font-size: 36px; font-weight: bold; color: #10b981; padding: 10px 20px; border-radius: 8px; background-color: #f3f4f6; display: inline-block; letter-spacing: 4px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <div style="margin-top: 30px;">
            <a href="${
              process.env.FRONTEND_HOST
            }/verify-otp/?email=${encodeURIComponent(
      user.email
    )}" style="font-size: 16px; color: #ffffff; background-color: #3b82f6; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Go to Fleet</a>
          </div>
        </div>
        <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px;">&copy; 2024 Fleet, Inc. All rights reserved.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.USEREMAIL,
      to: user.email,
      subject: "Your OTP Code for Fleet Account Registration",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return {
      message: "Email sent successfully",
      info,
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error sending email",
      status: 500,
    };
  }
};

export default sendMail;
