import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,reuqired:true},
    image:{type:String,reuqired:true},
    category:{type:String,reuqired:true}

})


const foodModel = mongoose.models.food || mongoose.model("food",foodSchema)

export default foodModel; 