import express from "express";
import { getAllPlots, createPlot, updatePlot, deletePlot } from "../controllers/plotController.js";

const router = express.Router();

// Plot routes
router.get("/", getAllPlots);
router.post("/", createPlot);
router.put("/:id", updatePlot);
router.delete("/:id", deletePlot);

export default router;
