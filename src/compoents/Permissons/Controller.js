
const service =require("./Service")
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

const Getcontroller =async(req,res)=>{
    try{
        const serviceGetdata =await service.Getservice()
        return res.status(200).json({
            message:"dataRecived",
            value:serviceGetdata
        })
    }catch(err){
        if(err){
            console.log(err)
            return res.status(400).json({
                message:"get failed"
            })
        }
    } return res.status(500).json({
        message:"server error"
    })
}

    const Updatecontroller =async(req,res)=>{

    try{
        const updatedatas =req.body
        // const employeeeid =req.params.id
        const updatedata = await service.Updateservice(updatedatas)
        return res.status(200).json({
            message:"updatedsucessfully",
            data:updatedata
        })
 

    }catch(err){
        if(err){
        console.log(err,"error")

        }
        
    }

   }
    const Deletecontroller =async(req,res)=>{

    try{
        const Deletedatas =req.body
        const Deletedata = await service.Deleteservice(Deletedatas)
        return res.status(200).json({
            message:"Deletedsucessfully",
            data:Deletedata
        })
 

    }catch(err){
        if(err){
        console.log(err,"error")

        }
        
    }

   }


module.exports ={Addcontroller,Getcontroller,Updatecontroller,Deletecontroller}