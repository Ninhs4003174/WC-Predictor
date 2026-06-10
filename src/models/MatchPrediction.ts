import mongoose, { Schema } from "mongoose";

export interface IMatchPrediction {
  guildId: string;
  userId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

const MatchPredictionSchema = new Schema<IMatchPrediction>(
  {
    guildId: {
      type: String,
      required: true
    },

    userId: {
      type: String,
      required: true
    },

    matchId: {
      type: String,
      required: true
    },

    homeTeam: {
      type: String,
      required: true
    },

    awayTeam: {
      type: String,
      required: true
    },

    homeGoals: {
      type: Number,
      required: true
    },

    awayGoals: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

MatchPredictionSchema.index(
  {
    guildId: 1,
    userId: 1,
    matchId: 1
  },
  {
    unique: true
  }
);

export const MatchPrediction = mongoose.model<IMatchPrediction>(
  "MatchPrediction",
  MatchPredictionSchema
);