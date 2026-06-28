import mongoose, { Schema } from "mongoose";

export interface IKnockoutPrediction {
  guildId: string;
  userId: string;
  rounds: Map<string, string[]>;
  completed: boolean;
  champion?: string | null;
}

const KnockoutPredictionSchema = new Schema<IKnockoutPrediction>(
  {
    guildId: {
      type: String,
      required: true
    },

    userId: {
      type: String,
      required: true
    },

    rounds: {
      type: Map,
      of: [String],
      default: {}
    },

    completed: {
      type: Boolean,
      default: false
    },

    champion: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

KnockoutPredictionSchema.index(
  {
    guildId: 1,
    userId: 1
  },
  {
    unique: true
  }
);

export const KnockoutPrediction = mongoose.model<IKnockoutPrediction>(
  "KnockoutPrediction",
  KnockoutPredictionSchema
);