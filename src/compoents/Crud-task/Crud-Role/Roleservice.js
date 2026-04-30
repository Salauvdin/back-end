const model = require("./Rolemodel")

const Addservice = async (addData) => {
   console.log(addData,"service")
   console.log(addData.roleName)
   const service = await model.Addmodel(addData.roleName, addData.roleDescription,
      addData.roleActive)
   console.log(service, "serviceerror")

   return service
}

const Getservice = async () => {
   const getService = await model.Getmodel()
   console.log(getService, "getservice")
   return getService
}

const Updateservice = async (updatedatas) => {

   return await model.Updatemodel(updatedatas.roleName, updatedatas.roleDescription,updatedatas.roleActive,updatedatas.roleId)
}
const Deleteservice = async (roleId) => {

   return await model.Deletemodel(roleId)
}
module.exports = { Addservice, Getservice, Updateservice, Deleteservice }