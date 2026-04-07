require('dotenv').config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")


connectToDB()

app.listen(3000,()=>{
    console.log("sever is running on port 3000");
    
})