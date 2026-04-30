const connection =require("../../../Connection")

const Addmodel =(roleName,roleDescription,roleActive)=>{
         // console.log(recruiterName,"add")
         return new Promise((resolve, reject) => {
                   let query =`insert into RoleDetails(roleName,roleDescription,roleActive)value(?,?,?)`
                   connection.dbconnection.query(query,[roleName,roleDescription,roleActive],(err,res)=>{
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
                let query = `
  SELECT roleId, roleName, roleDescription, roleActive
  FROM RoleDetails
  WHERE deletedata = 1
`
                 connection.dbconnection.query(query,(err,res)=>{
                    
                    if(err){
                        console.log(err ,"getmodel")
                        return reject(err,"hi")
                    }
                    return resolve(res)
                 })
         })

}

const Updatemodel =(roleName,roleDescription,roleActive,roleId)=>{
         return new Promise((resolve, reject) => {
                 let query=`UPDATE RoleDetails 
                 SET  roleName=? ,roleDescription=? ,roleActive=? 
                 WHERE roleid =?`;
                 connection.dbconnection.query(query,[roleName,roleDescription,roleActive,roleId],(err,res)=>{
                    if(err){
                        return reject(err)
                    }
                    return resolve(res)
                 })
         })

}
const Deletemodel = (roleId) => {
  return new Promise((resolve, reject) => {

    let query = `
      UPDATE RoleDetails 
      SET deletedata = 0
      WHERE roleId = ?
    `

    connection.dbconnection.query(query,[roleId],(err, result) => {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    })

  })
}

module.exports={Addmodel,Getmodel,Updatemodel,Deletemodel}