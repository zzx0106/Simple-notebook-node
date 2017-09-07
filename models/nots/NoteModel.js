"use strict";
import mongoose from "mongoose";
// import db from "../../db/db";
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  user_id: String,
  avatar_url: String,
  nickname: String,
  notes: [
    {
      replies: [
        {
          ups: [],
          nickname: String,
          content: String,
          create_at: String
        }
      ],
      opennum: Number,
      create_time: String,
      note_content: String,
      note_title: String,
      note_id: String
    }
  ]
});
const NoteModel = mongoose.model("notes", noteSchema);
export default NoteModel;
