
const service =require("./crudService")
const Addcontroller =async(req,res)=>{
               try{
                    const addData =req.body;
                    console.log(addData ,"controllerdata")
                    const servicedata =await service.Addservice(addData)
                    console.log(servicedata ,"controllerdata")
                    return res.status(200).json({
                        message:'userAddedsuccesfully',
                        data:servicedata
                    })
               }
               catch(err){
                if(err){
                    console.log(err)
                    return res.status(400).json({
                        message:"client side error"
                    })
                }

                return res.status(500).json({
                    message:"server side error "
                })
                // console.log(err,"error")
               }
    
}


    


module.exports ={Addcontroller}