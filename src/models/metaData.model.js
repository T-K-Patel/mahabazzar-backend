import mongoose from "mongoose";

const metaDataSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const MetaData = mongoose.model("MetaData", metaDataSchema);

export default MetaData;
