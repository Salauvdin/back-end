const connction =require("../../Connection")
const Addmodule =(id,name,age,phone_no)=>{

   return new Promise((resolve,reject)=>{
    let query =`insert into student(id,name,age,phone_no)values(?,?,?,?)`
      connction.dbconnection.query(query,[id,name,age,phone_no],(err,res)=>{
                       
           console.log(err,"error")
            console.log(res,"error")
          if(err){
            return(reject(err))
          }
          return resolve(res)
      })
   })
     
}
module.exports={Addmodule}