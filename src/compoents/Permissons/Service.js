const model = require("./Model")

const Addservice = async (addData) => {
   console.log(addData,"service")
   console.log(addData.recruiterName)
   const service = await model.Addmodel(addData.menuName, addData.Stutes)
   console.log(service, "serviceerror")

   return service
}

const Getservice = async () => {
   const getService = await model.Getmodel()
   console.log(getService, "getservice")
   return getService
}

const Updateservice = async (updatedatas) => {

   return await model.Updatemodel(updatedatas.menuName, updatedatas.Stutes,updatedatas.Id)
}
const Deleteservice = async (Deletedatas) => {

   return await model.Deletemodel(Deletedatas.Id)
}
module.exports = { Addservice, Getservice, Updateservice, Deleteservice }