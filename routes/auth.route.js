import express from "express"
import { registerUser, verifyUser, loginUser, getMe, logoutUser, forgotPassword, resetPassword } from "../controllers/auth.controller.js"


const userRouter= express.Router()

userRouter.post("/register", registerUser)
userRouter.get("/verify/:token", verifyUser)

userRouter.post("/login", loginUser)
userRouter.get("/me", getMe)
userRouter.get("/logout", logoutUser)

userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password/:token", resetPassword)

export default userRouter