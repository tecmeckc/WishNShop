const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const reviewSchema=new Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  rating:{
    type:Number,
    min:1,
    max:5
  },
  comment:{
    type:String,
    required:true,
  },
  createdAt:{
     type:Date,
     default:Date.now
  }
});
const productSchema=new Schema({
  
  productName:{
    type:String,
    required:true
  },
  image:{
    type:String,
    set: (v)=> v===""?"defaultLink":v,
   },
  Category:{
    type:String,
    required:true
  },
  About:{
    type:String,
    required:true
  },
   price:{
    type:Number,
    required:true
   },
   
 
  Reviews:[reviewSchema],
  Availability:[{
    location:
    {
      type:String,
      required:true,
    },
    Quantity:
    {
     type:Number,
     min:0
    }
  }],
  Reservation:{
    isReservable:{
      type:Boolean,
      default:false
    },
    reservationTime:{
      type:Date,
    },
    maxReservations:{
      type:Number,
      default:1
    }
  }
  
});
const product=mongoose.model('product',productSchema);
module.exports=product;