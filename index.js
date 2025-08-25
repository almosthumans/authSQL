import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

// custom routes
import userRouter from "./routes/auth.route.js"

dotenv.config()

const app= express()
const port= process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
    origin: process.env.BASE_URL
}))


app.get("/" , (req, res) => {
    res.status(200).json({
        success: true,
        message: "test checked"
    })

})

app.use("/api/v1/users", userRouter)

app.listen(port, () => {
    console.log(`Backend listening at ${port}`);
    
})