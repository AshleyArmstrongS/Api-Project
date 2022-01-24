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
    group_size: {
      type: Number,
      min: 0,
      max: 99999,
      integer: true,
      trim: true,
      default: 0,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
  { collection: "groups" }
);

module.exports = mongoose.model("Group", GroupSchema);
