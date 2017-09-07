"use strict";
import mongoose from "mongoose";
import db from "../../db/db";
import DATA_Documents from "../../initData/DATA_Documents";
const Schema = mongoose.Schema;

const documentsSchema = new Schema({
  name: String,
  knowledges: [
    {
      name: String,
      knowledges: [
        {
          name: String,
          url: String
        }
      ]
    }
  ]
});
const DocumentsModel = db.model("Docs", documentsSchema);
DocumentsModel.findOne((err, data) => {
  if (!data) {
    DocumentsModel.create(DATA_Documents);
    console.log("========insert DATA_Documents success!========");
  }
});
export default DocumentsModel;
