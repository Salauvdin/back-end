const bcrypt = require("bcryptjs");
const registermodel = require("./Registermodel")

const addRegisterservice = async (addregisterdata) => {
   // Hash the password before saving
   const hashedPassword = await bcrypt.hash(addregisterdata.registerPassword, 10);
   
   const Registerservice = await registermodel.addRegistermodel(
      addregisterdata.registerName, 
      addregisterdata.registerEmail,
       addregisterdata.registerDomain,
      addregisterdata.registerNumber, 
      hashedPassword,
      addregisterdata.registerConfirmpassword)
   console.log(Registerservice)
   console.log(addregisterdata)
   return Registerservice
}

const getRegisterservice = async () => {
   const getservice = await registermodel.getRegistermodel()
   console.log(getservice, "getservice")
   // console.log()
   return getservice

}

const updateRegisterservice = async (updatedata) => {
   // Hash the password if provided
   let passwordToUpdate = updatedata.registerPassword;
   if (updatedata.registerPassword) {
      passwordToUpdate = await bcrypt.hash(updatedata.registerPassword, 10);
   }
   
   const Updateservice = await registermodel.updateRegistermodel(
      updatedata.registerName,
      updatedata.registerEmail,
      updatedata.registerDomain,
      updatedata.registerNumber,
      passwordToUpdate,
      updatedata.registerId)
   console.log(Updateservice)
   return Updateservice

}
const deleteRegisterservice = async (deleteData) => {
   const Deleteservice = await registermodel.deleteRegistermodel(deleteData.registerId)
   console.log(Deleteservice)
   return deleteRegisterservice

}


module.exports = { addRegisterservice, getRegisterservice, updateRegisterservice, deleteRegisterservice }