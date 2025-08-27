import bcrypt from "bcryptjs";
import crypto from "crypto"
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'
import { log } from "console";

// prisma cleint should be inside nodemodules


const prisma = new PrismaClient()

const registerUser= async(req, res) => {
    // get data
    // validate
    // check if user exist
    // hash password
    // create verification token
    // create user add fields + hash, verToken
    // send verify email verify w/ verify route


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
        console.log(hashedPassword)

        // verificationToken
        const verificationToken= await crypto.randomBytes(32).toString("hex")
        console.log(verificationToken)

        // user.verificationToken= token
        // await user.save()    --> saved on line 57 / diffn than mongo

        /* 
        bcryptjs: hash pass
        crypto: verToken (built in )
        jwt: session cookie token
        
        */

        // create user
        const user= await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                verificationToken
            }
        })
        

        if(!user){
            return res.status(400).json({
                message: "User not registered"
            })
        }

        // send email
        const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD,
        },
        });


        const mailOption= {
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject: "Verify Account",
            html: `
                <p>Please click on the following link to verify your email:</p>
                <a href="${process.env.BASE_URL}/api/v1/users/verify/${verificationToken}">
                Verify Email
                </a>
            `
        }

        await transporter.sendMail(mailOption)

        res.status(201).json({
            message: "User register successfully",
            success: true
        })



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "registration failed",
            error
        })

    }


    
}

const verifyUser= async(req, res) => {
    // get data from params
    // validate
    // find user based on token 
    // isverified true
    // remove verification token 

    const {token}= req.params

    if(!token){
        return res.status(400).json({
            success: false,
            message: "invalid token"
        })
    }

    const user= await prisma.user.findFirst({
        where:{
            verificationToken: token
        }
    })

    if(!user){
        return res.status(400).json({
            success: false,
            message: "invalid token"
        })
    }

    // there is no .save() like Mongoose. Prisma is query-based, not stateful. You directly call an update

    await prisma.user.update({
        where: {id: user.id},
        data: {
            isVerified: true,
            verificationToken: null
        }
    })

    res.status(200).json({
        success: true,
        message:  "user verified succesfully"
    })


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

