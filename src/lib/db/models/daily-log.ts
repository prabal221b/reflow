import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"

  sleep?: {
    duration?: string;
    phoneInBed?: boolean;
  };
  energy?: number; // 1-5
  fog?: string;
  caffeine?: string;

  workStart?: {
    firstStep: string;
    noScrollCommitment: boolean;
    startedAt: Date;
    clean: boolean;
  };

  focusTarget: {
    sessions: number;
    minutesPerSession: number;
  };

  summary: {
    totalFocusMinutes: number;
    sessionsCompleted: number;
    sessionsAttempted: number;
    longestSession: number;
    plannedSocialWindows: number;
    actualSocialWindows: number;
    unplannedChecks: number;
    urgesLogged: number;
    relapses: number;
    cleanWorkStart: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const DailyLogSchema = new Schema<IDailyLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true },

    sleep: {
      duration: { type: String },
      phoneInBed: { type: Boolean },
    },
    energy: { type: Number, min: 1, max: 5 },
    fog: { type: String },
    caffeine: { type: String },

    workStart: {
      firstStep: { type: String },
      noScrollCommitment: { type: Boolean },
      startedAt: { type: Date },
      clean: { type: Boolean },
    },

    focusTarget: {
      sessions: { type: Number, default: 3 },
      minutesPerSession: { type: Number, default: 8 },
    },

    summary: {
      totalFocusMinutes: { type: Number, default: 0 },
      sessionsCompleted: { type: Number, default: 0 },
      sessionsAttempted: { type: Number, default: 0 },
      longestSession: { type: Number, default: 0 },
      plannedSocialWindows: { type: Number, default: 0 },
      actualSocialWindows: { type: Number, default: 0 },
      unplannedChecks: { type: Number, default: 0 },
      urgesLogged: { type: Number, default: 0 },
      relapses: { type: Number, default: 0 },
      cleanWorkStart: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: one log per user per day
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog: Model<IDailyLog> =
  mongoose.models.DailyLog ||
  mongoose.model<IDailyLog>("DailyLog", DailyLogSchema);

export default DailyLog;
