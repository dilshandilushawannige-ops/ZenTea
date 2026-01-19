import Crop from "../models/crop.js";

// Get all crops
export const getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().populate("plot").sort({ createdAt: -1 });
    res.json({ success: true, data: crops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new crop
export const createCrop = async (req, res) => {
  try {
    const payload = req.body;
    const created = await Crop.create({
      plot: payload.plot,
      cultivarName: payload.cultivarName,
      plantingDate: payload.plantingDate,
      expectedMaturityMonths: payload.expectedMaturityMonths || 0,
      status: payload.status || "Active",
      notes: payload.notes || "",
    });
    const populated = await created.populate("plot");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update a crop
export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Crop.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate("plot");
    if (!updated) return res.status(404).json({ success: false, message: "Crop not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a crop
export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Crop.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Crop not found" });
    res.json({ success: true, data: deleted._id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
