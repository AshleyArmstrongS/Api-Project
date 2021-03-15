const mongoose = require("mongoose");
const { atlasURI, atlasOptions } = require("./Config");

mongoose
  .connect(atlasURI, atlasOptions)
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));
