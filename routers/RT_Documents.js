"use strict";
import express from "express";
import CTL_Documents from "../controller/documents/CTL_Documents";
const router = express.Router();
router.get("/getdoclist", CTL_Documents.getDocument);
router.post("/deletedoclist", CTL_Documents.deleteDocument);
router.post("/adddoclist", CTL_Documents.addDocument);
router.post("/updatedoclist", CTL_Documents.updateDocument);
export default router;
