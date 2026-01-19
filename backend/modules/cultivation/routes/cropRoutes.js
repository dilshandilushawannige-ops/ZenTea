import express from "express";
import { getAllCrops, createCrop, updateCrop, deleteCrop } from "../controllers/cropController.js";

const router = express.Router();

// Crop routes
router.get("/", getAllCrops);
router.post("/", createCrop);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

export default router;
