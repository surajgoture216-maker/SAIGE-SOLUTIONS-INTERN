const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")

app.use(cors({ origin: 'http://localhost:4200' }))
app.use(bodyParser.json())

// One user stored here
const user = {
  email: "test@gmail.com",
  password: "1234"
}

app.post("/login", (req, res) => {
  const { email, password } = req.body

  if (email === user.email && password === user.password) {
    res.json({ message: "Login Successful" })
  } else {
    res.status(401).json({ message: "Invalid Credentials" })
  }
})

app.listen(3000, () => {
  console.log("Server started on port 3000")
})