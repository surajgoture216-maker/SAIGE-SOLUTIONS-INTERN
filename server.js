const express=require("express")
const app=express()
const bodyPaser=require("body-parser")
const bcrptjs=require('bcryptjs')
app.use(bodyPaser.json())
app.get("/",(req,res)=>{
  res.send("server is running successfully")
})
const users=[]
app.get('/users',(req,res)=>{
    res.json(users)
})
app.post('/users',(req,res)=>
{
  const {name,gmail,password}=req.body
  const hashedPassword=bcrptjs.hashSync(password,10)
  const user = {
    id: users.length + 1,
    name,
    gmail,
    password:hashedPassword
  }
  users.push(user)
  res.json(users)
})
app.get('/login',(req,res)=>
{
  const{gmail,password}=req.body
  const user=users.find((user)=>user.gmail===gmail)
  if(!user)
  {
    return res.status(401).json({message:'invalid credential'})
  }
  const isValidPassword=bcrptjs.compareSync(password,user.password)
  if(!isValidPassword)
  {
    return res.status(401).json({message:'invalid credential'})
  }
  res.json('login successfull',user)

})
app.listen(3000,()=>{
    console.log("server started on port 3000")
})
