const model = require("./crudModel")

const Addservice = async (addData) => {
   console.log(addData,"service")
   const service = await model.Addmodel(addData.userName,addData.userEmail,
      addData.userPassword, addData.userConfirmPassword)
   console.log(service, "serviceerror")

   return service
}


module.exports = { Addservice}