import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://razajafar73:7054965695@cluster0.b3lmm3r.mongodb.net/food-del').then(()=>console.log('DB connected'));

}