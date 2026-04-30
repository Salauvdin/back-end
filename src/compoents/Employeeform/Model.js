const connection =require("../../Connection")

const Addmodel =(recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword)=>{
         // console.log(recruiterName,"add")
         return new Promise((resolve, reject) => {
                   let query =`insert into RecruiterDetails(recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword)value(?,?,?,?,?,?)`
                   connection.dbconnection.query(query,[recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword],(err,res)=>{
                         if (err){
                            console.log(err,"modelerror")
                           return reject(err)
                         }
                         return resolve(res)
                   })
         })

}

const Getmodel =()=>{
         return new Promise((resolve, reject) => {
                 let query=`select recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword from RecruiterDetails where deletedata=1`
                 connection.dbconnection.query(query,(err,res)=>{
                    
                    if(err){
                        console.log(err ,"getmodel")
                        return reject(err,"hi")
                    }
                    return resolve(res)
                 })
         })

}

const Updatemodel =(recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword,recruiterId)=>{
         return new Promise((resolve, reject) => {
                 let query=`UPDATE RecruiterDetails 
                 SET  recruiterName=? ,recruiterDepartment=? ,recruiterRole=? ,recruiterEmail=? ,recruiterPassword=? ,recruiterConfirmPassword=?
                 WHERE recruiterId =?`;
                 connection.dbconnection.query(query,[recruiterName,recruiterDepartment,recruiterRole,recruiterEmail,recruiterPassword,recruiterConfirmPassword,recruiterId],(err,res)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(res)
                 })
         })

}
const Deletemodel =(recruiterId)=>{
         return new Promise((resolve, reject) => {
                 let query=`UPDATE RecruiterDetails 
                 SET  deletedata =0
                 WHERE recruiterId =?`;
                 connection.dbconnection.query(query,[recruiterId],(err,res)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(res)
                 })
         })

}

module.exports={Addmodel,Getmodel,Updatemodel,Deletemodel}