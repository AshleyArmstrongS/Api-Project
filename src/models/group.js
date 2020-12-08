const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    group_name: {
      type: String,
      required: true,
    },
    group_description: {
      type: String,
      default: "",
    },
    farmer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
    },
  },
  { timestamps: true },
  { collection: "groups" }
);

module.exports = mongoose.model("Group", GroupSchema);
