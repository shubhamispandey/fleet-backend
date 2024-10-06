import { responseFormat } from "../lib/helperFunctions.js";
import UserModel from "../models/User.js";

export const getUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res.status(404).json(
        responseFormat({
          data: null,
          message: "User not found",
          status: 404,
        })
      );

    res.status(200).json(
      responseFormat({
        data: user,
        message: "User found",
        status: 200,
      })
    );
  } catch (error) {
    return res.status(500).json(responseFormat());
  }
};
