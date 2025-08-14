import React, { useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useState } from 'react'
import axios from "axios"
import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {

  const {getTotalCartAmount,token,food_list,cartItems,url,foodList} = useContext(StoreContext)


  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""  
  })
  const onChangeHandler = (event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  


   const placeOrder = async (event) => {
      event.preventDefault();
 try {
    // Build order items array like before
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    const totalAmount = getTotalCartAmount() + 2;

    const response = await axios.post(
      url + "/api/order/place",
      {
        userId: token ? JSON.parse(atob(token.split('.')[1])).id : null, // decode token to get userId
        items: orderItems,
        amount: totalAmount,
        address: data
      },
      { headers: { token } }
    );

    if (response.data.success) {
      const { amount, currency,dbOrderId, orderId: razorpayOrderId} = response.data;

      const options = {
        key: "rzp_test_DGW5U01tmjjV4j", // Your Razorpay key
        amount: amount * 100, // in paise
        currency,
        name: "Tomato",
        description: "Order Payment",
        order_id:razorpayOrderId , // orderId,
        handler: async function (paymentResponse) {
               await axios.post(url + "/api/order/verify", {
                orderId: dbOrderId, // Send your DB order ID
               success: "true"

          });
          alert("Payment Successful");
          window.location.href = `/verify?success=true&orderId=${dbOrderId}`;
        
          //window.location.href = `/verify?success=true&orderId=${response.data.dbOrderId}`;
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone
        },
        theme: { color: "#3399cc" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      alert("Error creating order");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

const navigate = useNavigate()

 useEffect(() => {
   if(!token){

   }
   else if(getTotalCartAmount()===0){
    navigate('/cart')
   }
 }, [token])
 


   const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const countries = [
    "India", "United States", "United Kingdom", "Australia", "Canada", 
    "Germany", "France", "Japan", "China", "Brazil", "South Africa", 
    "Russia", "Italy", "New Zealand", "Singapore", "United Arab Emirates"
   
  ];


  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-feilds">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name'/>
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
          <div className="multi-feilds">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City'/>
          <select name="state" onChange={onChangeHandler} value={data.state}>
            <option value="">Select State</option>
            {indianStates.map((state,index)=>(
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
          {/* <input type="text" placeholder='State' /> */}
        </div>
          <div className="multi-feilds">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code'/>
         <select name="country" onChange={onChangeHandler} value={data.country}>
            <option value="">Select Country</option>
            {countries.map((state,index)=>(
              <option key={index} value={state}>{state}</option>
            ))}
          </select>
          {/* <input type="text" placeholder='Country' /> */}
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />

      </div>
      <div className="place-order-right">

         <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
          <div className="cart-total-details">
          <p>Subtotal</p>
          <p>${getTotalCartAmount()}</p>
         </div>
         <hr />
         <div className="cart-total-details">
          <p>Delivery Fee</p>
          <p>${getTotalCartAmount()===0?0:2}</p>
         </div>
         <hr />
         <div className="cart-total-details">
          <b>Total</b>
          <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
         </div>
         </div>
         <button type='submit'>PROCEED TO PAYMENT</button>
      </div>
        

      </div>
    </form>
  )
}

export default PlaceOrder


// const placeOrder = async (event) =>{
  //   event.preventDefault();
  //   let orderItems = [];
  //   food_list.map((item)=>{
  //     if(cartItems[item._id]>0){
  //       let itemInfo = item;
  //       itemInfo["quantity"] = cartItems[item._id];
  //       orderItems.push(itemInfo)
  //     }
    
  //   })
     
  //   let orderData = {
  //     address:data,
  //     items:orderItems,
  //     amount:getTotalCartAmount()+2,
  //   }
  //   let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
  //   if(response.data.success){
  //     const {session_url} = response.data;
  //     window.location.replace(session_url)
  //   }
  //     else{
  //       alert("Error")
  //     }
  // }