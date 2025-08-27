import { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcryptjs";
import crypto from "crypto"

const prisma= new PrismaClient()

const registerUser= async(req, res) => {
    // get data
    // validate
    // check if user exist
    // if not then create 
    // hash password
    // create verification token
    // send w/ email and verify route


    const {name, email, password, phone}= req.body

    if(!name || !password || !email || !phone){
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    try {
        const existingUser= await prisma.user.findUnique({
            where: {email}
        })

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "user already exist"
            })
        }

        // hash pass
        const hashedPassword= await bcrypt.hash(password, 10)

        // verificationToken
        const verificationToken= await crypto.randomBytes(32).toString("hex")

        /* 
        bcryptjs: hash pass
        crypto: verToken (built in )
        jwt: session cookie token
        
        */

        // create user
        const user= await prisma.user.create({
            name,
            email,
            phone,
            password: hashedPassword,
            verificationToken
        })


        // send email



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "registration failed",
            error
        })
    }


    
}

const verifyUser= async(req, res) => {

}

const loginUser= async(req, res) => {
    // get data
    // vaildate
    // create jwt token



    prisma.user


} 

const logoutUser= async(req, res) => {

}

const forgotPassword= async(req, res) => {

}

const resetPassword= async(req, res) => {

}


export {registerUser, verifyUser, loginUser, logoutUser, forgotPassword, resetPassword}

