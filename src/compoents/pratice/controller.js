// const { service } = require("./service");

const services =require("../src/compoents/Service")

const Addcontroller =async(req,res)=>{
  
    try{
        const data =req.body;
        console.log(data , "controllerdataaaaaaaaaaaa" )
        const service =await services.Addservice(data)
            return res.status(200).json({
            message:"userAdded sucessfully",
            data:service 
        })
        
    }catch(err){
        console.log("error",err)
    }
   
}

module.exports={Addcontroller}