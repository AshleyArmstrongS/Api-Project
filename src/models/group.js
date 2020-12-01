const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  group_name: {
    type: String,
    required: true
  },
  group_description: {
    type: String,
    default: ''
  },
  animal_tag_number: {
    type: Number,
    ref: "Animal"
  }
}, {timestamps: true}, {collection: 'groups'})

module.exports = mongoose.model('Group', GroupSchema);
