"use strict";
import mongoose from "mongoose";
import db from "../db/db";
const Schema = mongoose.Schema;

const requestNumbersSchema = new Schema({
  user_number: Number,
  user_login_number: Number,
  not_number: Number,
  admin_number: Number,
  admin_login_number: Number
});
const NumbersModel = db.model("requestnumbers", requestNumbersSchema);
export default NumbersModel;
