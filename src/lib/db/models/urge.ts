import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUrge extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trigger?: string;
  context?: string;
  resultedInRelapse: boolean;

  relapse?: {
    platform: string;
    estimatedDuration: number; // minutes
  };

  recoveryAction?: "rescue_block" | "dismissed" | "none";

  date: string;
  timestamp: Date;
  createdAt: Date;
}

const UrgeSchema = new Schema<IUrge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trigger: { type: String },
    context: { type: String, maxlength: 300 },
    resultedInRelapse: { type: Boolean, default: false },

    relapse: {
      platform: { type: String },
      estimatedDuration: { type: Number },
    },

    recoveryAction: {
      type: String,
      enum: ["rescue_block", "dismissed", "none"],
    },

    date: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

UrgeSchema.index({ userId: 1, date: 1 });

const Urge: Model<IUrge> =
  mongoose.models.Urge || mongoose.model<IUrge>("Urge", UrgeSchema);

export default Urge;
