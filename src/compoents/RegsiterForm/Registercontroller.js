  const Registerservice =require("./Registerservice")
  
const addRegistercontroller =async(req,res)=>{
    try{
        const addregisterdata =req.body;
        console.log(addregisterdata,"controllererror");
        const addUser = await Registerservice.addRegisterservice(addregisterdata)
       return res.status(200).json({
            message:"userAddedsucessfully",
            data:addUser
        })
    }catch(err){
        if(err){
                console.log(err)

            return res.status(400).json({
                messsage:"code error"
            })
        } 
        console.log(err)
        return res.status(500).json({
            message:"server side error"
        })
    }
}

const getRegistercontroller =async(req,res)=>{
    try{
        console.log(req)
 const getUser= await Registerservice.getRegisterservice()
 
    return res.status(200).json({
        message:"getsuccess",
        data:getUser
    })
     
    }
    catch(err){
        if(err){
            console.log(err)
            return res.status(400).json({
                message:"client side error",
            })
        }
        return res.status(500).json({
            message:"server side error"
        })
    }
   


}

const updateRegistercontroller =async(req,res)=>{
                   try{
                     const updateData =req.body;
                     console.log(updateData, "updateuserdataaaaaa")
                    const Updatecontroller =await Registerservice.updateRegisterservice(updateData)
                       return res.status(200).json({
                        message:"updatedSuccessfully",
                        value:Updatecontroller
                       })
                   }catch(err){
                  if(err){
                    console.log(err, "catcherrrorrrrrrrr")
                return res.status(400).json({
                message:"client side error",
            })
        }
       return res.status(500).json({
            message:"server side error"
        })
    }


}
const deleteRegistercontroller =async(req,res)=>{
                try{
                    const deleteData =req.body ;
                    const  Deletecontroller = await Registerservice.deleteRegisterservice(deleteData)
                    return res.status(200).json({
                        message:"DeleteSuccessfully",
                        value:Deletecontroller
                        
                       })
                   }catch(err){
        if(err){
            console.log(err)
            res.status(400).json({
                message:"client side error",
            })
        }
        res.status(500).json({
            message:"server side error"
        })
    }
                    
                

           
}
 module.exports ={addRegistercontroller,getRegistercontroller,updateRegistercontroller,deleteRegistercontroller}