import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFocusSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "regular" | "rescue";
  status: "active" | "completed" | "paused" | "cancelled" | "expired";

  plannedDuration: number; // seconds
  actualDuration?: number; // seconds

  startedAt: Date;
  pausedAt?: Date;
  pausedDuration: number; // total seconds paused
  completedAt?: Date;
  expiresAt: Date;

  preReflection?: {
    task: string;
  };
  postReflection?: {
    rating: "great" | "okay" | "struggled" | "interrupted";
    note?: string;
  };

  date: string; // "YYYY-MM-DD"
  createdAt: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["regular", "rescue"], default: "regular" },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled", "expired"],
      default: "active",
    },

    plannedDuration: { type: Number, required: true },
    actualDuration: { type: Number },

    startedAt: { type: Date, required: true },
    pausedAt: { type: Date },
    pausedDuration: { type: Number, default: 0 },
    completedAt: { type: Date },
    expiresAt: { type: Date, required: true },

    preReflection: {
      task: { type: String, maxlength: 200 },
    },
    postReflection: {
      rating: {
        type: String,
        enum: ["great", "okay", "struggled", "interrupted"],
      },
      note: { type: String, maxlength: 500 },
    },

    date: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

FocusSessionSchema.index({ userId: 1, date: 1 });
FocusSessionSchema.index({ userId: 1, status: 1 });

const FocusSession: Model<IFocusSession> =
  mongoose.models.FocusSession ||
  mongoose.model<IFocusSession>("FocusSession", FocusSessionSchema);

export default FocusSession;
