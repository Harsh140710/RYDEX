import mongoose, { Document, models } from "mongoose";

interface IUser extends Document {
    name: string,
    email: string,
    password?: string,
    role: "user" | "partner" | "admin",
    createdAt: Date,
    updatedAt: Date,
};

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
    },

    role: {
        type: String,
        default: "user",
        enum: ["user", "partner", "admin"]
    }
}, { timestamps: true });

export const User = models.User || mongoose.model("User", userSchema);