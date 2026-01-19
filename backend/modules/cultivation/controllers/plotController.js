import Plot from '../models/plot.js'

// Get all plots
export const getAllPlots = async (req, res) => {
  try {
    const plots = await Plot.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new plot
export const createPlot = async (req, res) => {
  try {
    const payload = req.body;
    const created = await Plot.create({
      name: payload.name,
      estateName: payload.estateName || "",
      areaHa: payload.areaHa,
      elevationM: payload.elevationM || 0,
      soilType: payload.soilType || "Other",
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update a plot
export const updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Plot.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Plot not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a plot
export const deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Plot.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Plot not found" });
    res.json({ success: true, data: deleted._id });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
