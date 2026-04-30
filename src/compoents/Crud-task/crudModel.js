const connection =require("../../Connection")

const Addmodel =(userName,userEmail,userPassword,userConfirmPassword)=>{
         // console.log(recruiterName,"add")
         return new Promise((resolve, reject) => {
                   let query =`insert into userDetails(userName,userEmail,userPassword,userConfirmPassword)value(?,?,?,?)`
                   connection.dbconnection.query(query,[userName,userEmail,userPassword,userConfirmPassword],(err,res)=>{
                         if (err){
                            console.log(err,"modelerror")
                           return reject(err)
                         }
                         return resolve(res)
                   })
         })

}



module.exports={Addmodel}