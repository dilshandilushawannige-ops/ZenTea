import mongoose from "mongoose";

const plotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    estateName: { type: String, default: "" },
    areaHa: { type: Number, required: true, min: 0 },
    elevationM: { type: Number, default: 0 },
    soilType: { type: String, enum: ["Loamy", "Sandy", "Clay", "Other"], default: "Other" },
  },
  { timestamps: true }
);

const Plot = mongoose.model("Plot", plotSchema);

export default Plot;
