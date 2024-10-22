import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const MeetModel = mongoose.model("Meet", meetingSchema);

export default MeetModel;
