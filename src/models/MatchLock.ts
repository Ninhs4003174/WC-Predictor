import mongoose, { Schema } from "mongoose";

export interface IMatchLock {
  guildId: string;
  matchId: string;
  locked: boolean;
  lockedBy?: string | null;
  lockedAt?: Date | null;
}

const MatchLockSchema = new Schema<IMatchLock>(
  {
    guildId: {
      type: String,
      required: true
    },

    matchId: {
      type: String,
      required: true
    },

    locked: {
      type: Boolean,
      default: true
    },

    lockedBy: {
      type: String,
      default: null
    },

    lockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

MatchLockSchema.index(
  {
    guildId: 1,
    matchId: 1
  },
  {
    unique: true
  }
);

export const MatchLock = mongoose.model<IMatchLock>(
  "MatchLock",
  MatchLockSchema
);