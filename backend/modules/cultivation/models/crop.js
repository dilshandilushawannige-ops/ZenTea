import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    plot: { type: mongoose.Schema.Types.ObjectId, ref: "Plot", required: true },
    cultivarName: { type: String, required: true },
    plantingDate: { type: Date, required: true },
    expectedMaturityMonths: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Replanted", "Retired"], default: "Active" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;
