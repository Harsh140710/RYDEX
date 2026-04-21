import mongoose, { models, Schema } from "mongoose";

export interface IpartnerDocs extends Document {
  owner: mongoose.Types.ObjectId;
  aadharUrl: string;
  rcUrl: string;
  licenseUrl: string;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partnerDocsSchema = new Schema<IpartnerDocs>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    aadharUrl: String,
    rcUrl: String,
    licenseUrl: String,

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    rejectionReason: String,
  },
  { timestamps: true },
);

export const PartnerDocs = models.PartnerDocs || mongoose.model("PartnerDocs", partnerDocsSchema);
