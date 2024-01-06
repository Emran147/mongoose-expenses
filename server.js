// Server setup
const express = require('express')
const app = express()
const api = require('./server/routes/api')
app.use(express.json()); // Body parsing middleware




const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/ExpenseDB", {
  useNewUrlParser: true,
}).catch((err)=> console.log(err))

app.use('/', api)

const port = 3000
app.listen(port, function () {
    console.log(`Running on port ${port}`)
})


