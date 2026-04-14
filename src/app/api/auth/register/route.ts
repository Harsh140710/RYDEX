import connectDB from "@/lib/db";
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
        if (user) {
            return NextResponse.json(
                { message: "Email already exist." },
                { status: 400 }
            )
        }

        // Check Password length
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must have at least 6 laters." },
                { status: 400 }
            )
        }

        // Hashed password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user in Database
        user = await User.create({
            name,
            email,
            password: hashedPassword
        })

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