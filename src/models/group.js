const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;
const val = require("../models/mongoose_validation");

const GroupSchema = new Schema(
  {
    group_name: {
      type: String,
      trim: true,
      validate: [
        val.validateGroupName,
        "Invalid, please enter valid group name",
      ],
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
