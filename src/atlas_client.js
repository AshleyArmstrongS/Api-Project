const mongoose = require('mongoose');
const uri = "mongodb+srv://conor:simple@cluster0.hncou.mongodb.net/OptiFarm?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected…')
})
.catch(err => console.log(err))

