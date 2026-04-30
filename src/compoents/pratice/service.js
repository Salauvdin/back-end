
const model =require("./model")
const service =async(data)=>{
       const result =await model.Addmodule(data.id,data.name,data.age,data.phone_no)
       return result
}


module.exports={service}