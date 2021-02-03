const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const validateGroupName = name => {
  const re = /^[a-zA-Z ]{2,30}$/
  re.test(name) 
  return re
}

const GroupSchema = new Schema(
  {
    group_name: {
      type: String,
      trim: true,
      validate: [validateGroupName, 'Invalid, please enter valid group name'],
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
