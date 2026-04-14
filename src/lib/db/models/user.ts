import mongoose, { Schema, Document, Model } from "mongoose";
import { DEFAULT_SETTINGS } from "../../constants";
import { randomBytes } from "crypto";

const generatePublicId = () => `u_${randomBytes(6).toString("hex")}`;

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  provider: "credentials" | "google";
  providerId?: string;
  publicId: string;

  onboarding: {
    completed: boolean;
    completedAt?: Date;
    skippedSteps: string[];
    responses: {
      workPattern?: string;
      peakFocus?: string;
      worstFocus?: string;
      platforms: string[];
      dailyUsageHours?: number;
      triggers: string[];
      avgSleepHours?: number;
      phoneInBed?: boolean;
      morningEnergy?: string;
    };
  };

  settings: {
    focusInterval: number;
    focusProgression: string;
    progressionSpeed: string;
    theme: string;
    reducedMotion: boolean;
    notifications: {
      focusReminders: boolean;
      socialWindowAlerts: boolean;
      dailySummary: boolean;
    };
    timezone: string;
    workdayStart: string;
    workdayEnd: string;
    socialWindowDefaults: {
      duration: number;
      maxPerDay: number;
    };
  };

  currentFocusInterval: number;
  consecutiveSuccesses: number;

  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  lastActiveTimezone: string;
  deletionRequestedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    providerId: { type: String },
    publicId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: generatePublicId,
    },

    onboarding: {
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      skippedSteps: [{ type: String }],
      responses: {
        workPattern: { type: String },
        peakFocus: { type: String },
        worstFocus: { type: String },
        platforms: [{ type: String }],
        dailyUsageHours: { type: Number },
        triggers: [{ type: String }],
        avgSleepHours: { type: Number },
        phoneInBed: { type: Boolean },
        morningEnergy: { type: String },
      },
    },

    settings: {
      focusInterval: {
        type: Number,
        default: DEFAULT_SETTINGS.focusInterval,
      },
      focusProgression: { type: String, default: "auto" },
      progressionSpeed: { type: String, default: "normal" },
      theme: { type: String, default: "system" },
      reducedMotion: { type: Boolean, default: false },
      notifications: {
        focusReminders: { type: Boolean, default: true },
        socialWindowAlerts: { type: Boolean, default: true },
        dailySummary: { type: Boolean, default: false },
      },
      timezone: { type: String, default: "UTC" },
      workdayStart: { type: String, default: "09:00" },
      workdayEnd: { type: String, default: "17:30" },
      socialWindowDefaults: {
        duration: { type: Number, default: 15 },
        maxPerDay: { type: Number, default: 4 },
      },
    },

    currentFocusInterval: {
      type: Number,
      default: DEFAULT_SETTINGS.focusInterval,
    },
    consecutiveSuccesses: { type: Number, default: 0 },

    lastActiveAt: { type: Date, default: Date.now },
    lastActiveTimezone: { type: String, default: "UTC" },
    deletionRequestedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
