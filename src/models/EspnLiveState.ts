import mongoose, { Schema } from "mongoose";

export interface IEspnLiveState {
  espnId: string;
  matchName: string;
  kickoffUtc: string;
  lastStatus: string;
  lastHomeScore: number;
  lastAwayScore: number;
  postedGoalKeys: string[];
  halfTimePosted: boolean;
  fullTimePosted: boolean;
}

const EspnLiveStateSchema = new Schema<IEspnLiveState>(
  {
    espnId: {
      type: String,
      required: true,
      unique: true
    },

    matchName: {
      type: String,
      required: true
    },

    kickoffUtc: {
      type: String,
      required: true
    },

    lastStatus: {
      type: String,
      required: true
    },

    lastHomeScore: {
      type: Number,
      required: true
    },

    lastAwayScore: {
      type: Number,
      required: true
    },

    postedGoalKeys: {
      type: [String],
      default: []
    },

    halfTimePosted: {
      type: Boolean,
      default: false
    },

    fullTimePosted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const EspnLiveState = mongoose.model<IEspnLiveState>(
  "EspnLiveState",
  EspnLiveStateSchema
);