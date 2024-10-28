const mongoose = require("mongoose");
const { Schema } = mongoose;

const DocumentSchema = new Schema({
    _id: String,
    data: {
        type: Schema.Types.Mixed, // Allows any type (e.g., object, string, etc.)
        default: ""
    }
});

module.exports = mongoose.model("Document", DocumentSchema);
