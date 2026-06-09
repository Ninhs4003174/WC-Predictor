import mongoose, { Schema } from "mongoose";

export interface IWorldCupPrediction {
  guildId: string;
  userId: string;
  predictions: Map<string, string[]>;
  completed: boolean;
}

const WorldCupPredictionSchema = new Schema<IWorldCupPrediction>(
  {
    guildId: {
      type: String,
      required: true
    },

    userId: {
      type: String,
      required: true
    },

    predictions: {
      type: Map,
      of: [String],
      default: {}
    },

    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

WorldCupPredictionSchema.index(
  {
    guildId: 1,
    userId: 1
  },
  {
    unique: true
  }
);

export const WorldCupPrediction = mongoose.model<IWorldCupPrediction>(
  "WorldCupPrediction",
  WorldCupPredictionSchema
);