import { generateMeetingCode, responseFormat } from "../lib/helperFunctions.js";
import Meeting from "../models/Meet.js";
import User from "../models/User.js";

export const createMeet = async (req, res) => {
  const { email } = req.body;

  // Generate meeting code
  const meetingCode = generateMeetingCode();

  // Create and save new meeting
  try {
    const user = await User.findOne({ email: email });
    const meeting = new Meeting({
      code: meetingCode,
      createdBy: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
    });

    await meeting.save();

    res.status(201).json(
      responseFormat({
        message: "Meeting created successfully",
        data: { meetingCode, meeting },
        status: 201,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(responseFormat({ message: "Error creating meeting", status: 500 }));
  }
};

export const getMeetInfo = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json(
      responseFormat({
        message: "Meeting code is required",
        status: 400,
      })
    );
  }

  try {
    const meeting = await Meeting.findOne({ code });

    if (!meeting) {
      return res.status(404).json(
        responseFormat({
          message: "Meeting not found",
          status: 404,
        })
      );
    }

    return res.status(200).json(
      responseFormat({
        message: "Meeting info found",
        data: { meetingCode: code, meeting },
        status: 200,
      })
    );
  } catch (error) {
    console.error("Error fetching meeting info:", error);
    return res.status(500).json(
      responseFormat({
        message: "Internal Server Error",
        status: 500,
      })
    );
  }
};
