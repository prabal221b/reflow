import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "planned" | "unplanned";
  status: "scheduled" | "active" | "completed";

  platform: string;
  intent?: string;

  scheduledStart?: Date;
  scheduledDuration?: number; // minutes

  actualStart?: Date;
  actualDuration?: number; // minutes

  date: string;
  createdAt: Date;
}

const SocialSessionSchema = new Schema<ISocialSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["planned", "unplanned"], required: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "scheduled",
    },

    platform: { type: String, required: true },
    intent: { type: String, maxlength: 200 },

    scheduledStart: { type: Date },
    scheduledDuration: { type: Number },

    actualStart: { type: Date },
    actualDuration: { type: Number },

    date: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

SocialSessionSchema.index({ userId: 1, date: 1 });

const SocialSession: Model<ISocialSession> =
  mongoose.models.SocialSession ||
  mongoose.model<ISocialSession>("SocialSession", SocialSessionSchema);

export default SocialSession;
