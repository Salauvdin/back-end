   
     const connection =require('../../Connection')

const addRegistermodel =(registerName,registerEmail,registerDomain,registerNumber,registerPassword,registerConfirmpassword)=>{
           return new Promise((resolve, reject) => {
                 const query = `insert into candidateDetails(registerName,registerEmail,registerDomain,registerNumber,registerPassword
                ,registerConfirmpassword ) values(?,?,?,?,?,?)`
                connection.dbconnection.query(query,[registerName,registerEmail,registerDomain,registerNumber,
                    registerPassword,registerConfirmpassword],(err,res)=>{
                             
                            if(err){
                                console.log(err,"addRegistermodelerror")
                                 return reject(err)
                            }
                            console.log(res)
                              return resolve(res)
                    })
                    
           })
}
 const getRegistermodel =()=>{ 
         return new Promise((resolve, reject) => {
               const query =`select  registerName,registerEmail,registerDomain,registerNumber,registerPassword from candidateDetails where deleteData =1`
               connection.dbconnection.query(query,(err,res)=>{
                    if(err){
                         console.log(err,"hii")
                         return reject(err,"")
                    }
                       return resolve(res,"getmodelokay")
               })
         })
            

 }
     const updateRegistermodel =(registerName,registerEmail,registerDomain,registerNumber,registerPassword,registerId)=>{
               return new Promise((resolve, reject) => {
                    const query =`UPDATE candidateDetails
                    SET registerName=?,registerEmail=?,registerDomain=?,registerNumber=?,registerPassword=?
                    where registerId=?`;
                    connection.dbconnection.query(query,[registerName,registerEmail,registerDomain,registerNumber,
                         registerPassword,registerId],(err,res)=>{
                              if(err){
                                   console.log(err, "updatemodelerror")
                              return reject(err)
                         }
                         return resolve(res,"updatemodelokay")
                         })
               })

     }
  const deleteRegistermodel =(registerId)=>{
               return new Promise((resolve, reject) => {
                    const query =`update candidateDetails
                     SET deleteData = 0
                    where registerId=?`
                    connection.dbconnection.query(query,[registerId],(err,res)=>{
                          if(err){
                         return reject(err,"")
                    }
                       return resolve(res,"Deletemodelokay")

                    })
               })

  }

  module.exports={addRegistermodel,getRegistermodel,updateRegistermodel,deleteRegistermodel}