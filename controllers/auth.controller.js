import bcrypt from "bcryptjs";
import crypto from "crypto"
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
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
    // validate
    // find user based on email
    // compare password
    // generate jwt token and set cookie
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: "Please verify your account before logging in" })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        })

        const cookieExpiryDays = process.env.COOKIE_EXPIRES_IN ? parseInt(process.env.COOKIE_EXPIRES_IN) : 1

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000)
        })

        // return user without sensitive fields
        const { password: _pass, verificationToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user

        return res.status(200).json({ success: true, token, user: safeUser })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Login failed', error })
    }

} 

const getMe = async (req, res) => {
    // find user based on user.id from cookies and return user without password
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return res.status(404).json({ success: false, message: 'User not found' })

        const { password: _pass, verificationToken, passwordResetToken, passwordResetExpiry, ...safeUser } = user
        return res.status(200).json({ success: true, user: safeUser })

    } catch (error) {
        console.log(error)
        return res.status(401).json({ success: false, message: 'Invalid token or session expired' })
    }
}

const logoutUser= async(req, res) => {

    // Overwrite auth cookie with empty value and expire immediately
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0)
    })

    return res.status(200).json({ success: true, message: 'User logged out' })

}

const forgotPassword= async(req, res) => {

    // get email, validate, find user, create reset token & expiry, save, send email
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(400).json({ success: false, message: 'No user found with that email' })
        }

        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiry = Date.now() + 15 * 60 * 1000 // 15 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpiry: expiry.toString()
            }
        })

        // send reset email
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD
            }
        })

        const mailOption = {
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject: 'Reset Password',
            html: `
                <p>Please click the link to reset your password. This link is valid for 15 minutes.</p>
                <a href="${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}">Reset Password</a>
            `
        }

        await transporter.sendMail(mailOption)

        return res.status(200).json({ success: true, message: 'Password reset email sent' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Could not process request', error })
    }

}

const resetPassword= async(req, res) => {

    // get token and new password, validate token and expiry, update password, clear reset fields
    const { token } = req.params
    const { password } = req.body

    if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' })
    }

    try {
        const user = await prisma.user.findFirst({ where: { passwordResetToken: token } })

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' })
        }

        if (!user.passwordResetExpiry || parseInt(user.passwordResetExpiry) < Date.now()) {
            return res.status(400).json({ success: false, message: 'Token expired' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiry: null
            }
        })

        return res.status(200).json({ success: true, message: 'Password reset successful' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Could not reset password', error })
    }

}


export {registerUser, verifyUser, loginUser, logoutUser, forgotPassword, resetPassword, getMe}

