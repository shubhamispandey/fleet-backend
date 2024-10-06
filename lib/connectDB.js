import mongoose from "mongoose";

async function connectDatabase(DATABASE_URL) {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("DB connection established");
  } catch (e) {
    console.log(e);
  }
}

export default connectDatabase;
