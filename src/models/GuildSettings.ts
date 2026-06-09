import mongoose, { Schema } from "mongoose";

export interface IGuildSettings {
  guildId: string;
  picksLocked: boolean;
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

    picksLocked: {
      type: Boolean,
      default: false
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