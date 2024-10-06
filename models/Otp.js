import mongoose from "mongoose";

const OtpSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 10 * 60 * 1000,
  },
});

const OtpModel = mongoose.model("OtpModel", OtpSchema);

export default OtpModel;
