import mongoose, { Schema } from "mongoose";

export interface IGuildSettings {
  guildId: string;

  /**
   * Legacy field.
   * Do not use for new lock checks.
   */
  picksLocked?: boolean;

  groupPicksLocked: boolean;
  groupPicksLockedBy?: string | null;
  groupPicksLockedAt?: Date | null;

  matchPicksLocked: boolean;
  matchPicksLockedBy?: string | null;
  matchPicksLockedAt?: Date | null;

  lockedBy?: string | null;
  lockedAt?: Date | null;
}

const GuildSettingsSchema = new Schema<IGuildSettings>(
  {
    guildId: {
      type: String,
      required: true,
      unique: true
    },

    /**
     * Legacy field from the old global lock system.
     * Keep it so old database documents do not break,
     * but new code should use groupPicksLocked or matchPicksLocked.
     */
    picksLocked: {
      type: Boolean,
      default: false
    },

    groupPicksLocked: {
      type: Boolean,
      default: false
    },

    groupPicksLockedBy: {
      type: String,
      default: null
    },

    groupPicksLockedAt: {
      type: Date,
      default: null
    },

    matchPicksLocked: {
      type: Boolean,
      default: false
    },

    matchPicksLockedBy: {
      type: String,
      default: null
    },

    matchPicksLockedAt: {
      type: Date,
      default: null
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

export const GuildSettings = mongoose.model<IGuildSettings>(
  "GuildSettings",
  GuildSettingsSchema
);