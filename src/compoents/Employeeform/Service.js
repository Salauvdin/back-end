const model = require("./Model")

const Addservice = async (addData) => {
   console.log(addData,"service")
   console.log(addData.recruiterName)
   const service = await model.Addmodel(addData.recruiterName, addData.recruiterDepartment,
      addData.recruiterRole, addData.recruiterEmail, addData.recruiterPassword,addData.recruiterConfirmPassword)
   console.log(service, "serviceerror")

   return service
}

const Getservice = async () => {
   const getService = await model.Getmodel()
   console.log(getService, "getservice")
   return getService
}

const Updateservice = async (updatedatas) => {

   return await model.Updatemodel(updatedatas.recruiterName, updatedatas.recruiterDepartment, updatedatas.recruiterRole,updatedatas.recruiterEmail,updatedatas.recruiterPassword,updatedatas.recruiterConfirmPassword,updatedatas.recruiterId)
}
const Deleteservice = async (Deletedatas) => {

   return await model.Deletemodel(Deletedatas.recruiterId)
}
module.exports = { Addservice, Getservice, Updateservice, Deleteservice }