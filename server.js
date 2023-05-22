const express = require('express')
const app = express()
const login = require('./routes/login')
const register = require('./routes/register')

// app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.use('/register',register)
app.use('/login',login)

app.listen(3055,()=>{
console.log('Server running at port 3055');
})