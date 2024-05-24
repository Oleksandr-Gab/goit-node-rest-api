import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Set name for contact"],
        },
        email: {
            type: String,
        },
        phone: {
            type: Number,
            required: true,
        },
        favorite: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false,
    }
);

export default mongoose.model("Contact", contactSchema);
