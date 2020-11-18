const mongoose = require('mongoose');
const uri = "mongodb+srv://AshleyArmstrong:simple@cluster0.ikcii.mongodb.net/OptiFarmTestDb?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected…')
})
.catch(err => console.log(err))

