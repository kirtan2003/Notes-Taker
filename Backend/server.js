import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from "./db/index.js";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({    
    limit: "16kb"
}));
app.use(express.urlencoded({ extended: true ,  limit: "16kb"}))

app.use(express.static("public"))
app.use(cookieParser())

dotenv.config({
    path: './.env'
}
);
//routes import 
import authRoutes from './routes/authRoutes.js';
import noteRoutes from "./routes/noteRoutes.js";


//routes declaration
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/notes", noteRoutes);



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 9000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
    
})
.catch((error)=>{
    console.log("MongoDB connection Failed!!! ", error)
})

