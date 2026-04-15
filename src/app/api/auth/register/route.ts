import connectDB from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import { User } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()

        // Connect with Database
        await connectDB()

        // Check user exist or not
        let user = await User.findOne({ email })
        if (user && user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email already exist." },
                { status: 400 }
            )
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        // Check Password length
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must have at least 6 laters." },
                { status: 400 }
            )
        }

        // Hashed password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Email verify and send otp
        if (user && !user.isEmailVerified) {
            user.name = name
            user.passswrod = hashedPassword
            user.email = email
            user.otp = otp
            user.otpExpiresAt = otpExpiresAt

            // Save user
            await user.save()
        } else {
            // Create user in Database
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiresAt
            })
        }

        // OTP send on user email
        await sendMail(
            email,
            "Your OTP for Email Verificaton",
            `<h2>Your Email Verification OTP is <strong>${otp}</strong></h2>`
        )

        return NextResponse.json(
            user,
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: `Register error ${error}` },
            { status: 500 }
        )
    }
}