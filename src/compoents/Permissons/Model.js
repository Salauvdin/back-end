const connection =require("../../Connection")

const Addmodel =(menuName,Stutes)=>{
         // console.log(recruiterName,"add")
         return new Promise((resolve, reject) => {
                   let query =`insert into Permissions(menuName,Stutes)value(?,?)`
                   connection.dbconnection.query(query,[menuName,Stutes],(err,res)=>{
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
                 let query=`select menuName,Stutes from Permissions where deletedata=1`
                 connection.dbconnection.query(query,(err,res)=>{
                    
                    if(err){
                        console.log(err ,"getmodel")
                        return reject(err,"hi")
                    }
                    return resolve(res)
                 })
         })

}

const Updatemodel =(menuName,Stutes,Id)=>{
         return new Promise((resolve, reject) => {
                 let query=`UPDATE Permissions
                 SET  menuName=? ,Stutes=?
                 WHERE Id =?`;
                 connection.dbconnection.query(query,[menuName,Stutes,Id],(err,res)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(res)
                 })
         })

}
const Deletemodel =(Id)=>{
         return new Promise((resolve, reject) => {
                 let query=`UPDATE Permissions 
                 SET  deletedata =0
                 WHERE Id =?`;
                 connection.dbconnection.query(query,[Id],(err,res)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(res)
                 })
         })

}

module.exports={Addmodel,Getmodel,Updatemodel,Deletemodel}