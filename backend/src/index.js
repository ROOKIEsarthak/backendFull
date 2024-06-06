// ----------> THIS IS THE SERVER FILE . HERE ALL THE CONFIGURATION FOR THE SERVER IS DONE

//require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
const port = process.env.PORT || 8000;
import connectDb from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDb()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server running on port : ${port}`);
      });
    } catch (error) {
      console.error("ERROR: ", error);
      throw err;
    }
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });

/*
import express from 'express';
const app = express();


;(async()=>{
    try 
    {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error -: Unable to talk to database");
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port : ${process.env.PORT}`);
        })
    } catch (error) 
    {
        console.error("ERROR: ",error);
        throw err;
        
    }
})()

*/
