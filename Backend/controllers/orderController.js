import Razorpay from "razorpay";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const frontend_url = "http://localhost:5174";


const placeOrder = async (req, res) => {
    try {
        // STEP 1: Save order in DB (same as your current logic)
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();

        // Empty the user's cart
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // STEP 2: Create Razorpay order
        const options = {
            amount: req.body.amount * 100*80, // paise
            currency: "INR",
            receipt: `order_rcptid_${newOrder._id}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // STEP 3: Send order details to frontend
        res.json({
            success: true,
            orderId: razorpayOrder.id,
            currency: "INR",
            amount: req.body.amount,
            dbOrderId: newOrder._id
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error placing order" });
    }
};

const verifyOrder = async (req,res) =>{
    const {orderId,success} = req.body;
    try {
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
            
            
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
        
    }
}

//user orders for frontend
const userOrders = async (req,res)=>{
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}

//Listing orders for admin panel
const listOrders = async (req,res) =>{
        try {
            const orders = await orderModel.find({})
            res.json({success:true,data:orders})
        } catch (error) {
            console.log(error);
            res.json({success:true,message:"Error"})
            
        }
}

//api for updating status
const updateStatus = async (req,res)=>{
   try {
      await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
      res.json({success:true,message:"Status Updated"})
   } catch (error) {
     console.log(error);
     res.json({success:false,message:"Error"})
     
   }
}

export { placeOrder ,verifyOrder,userOrders,listOrders,updateStatus};

