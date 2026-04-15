import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(req: Request) {
    try {
        // Connect Database for check OTP
        await connectDB()

        const { email, otp } = await req.json()

        if (!email && !otp) {
            return Response.json(
                { message: "Email and OTP is required." },
                { status: 400 }
            )
        }

        // Check user exist or not
        let user = await User.findOne({ email })
        if (!user) {
            return Response.json(
                { message: "User not found." },
                { status: 400 }
            )
        }

        // Check email already verified
        if (user.isEmailVerified) {
            return Response.json(
                { message: "Email is already Verified." },
                { status: 400 }
            )
        }

        // Check OTP expiry date
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return Response.json(
                { message: "OTP has been Expired." },
                { status: 400 }
            )
        }

        // OTP is correct or not
        if (!user.otp || user.otp !== otp) {
            return Response.json(
                { message: "Invalid OTP." },
                { status: 400 }
            )
        }

        user.isEmailVerified = true
        user.otp = undefined
        user.otpExpiresAt = undefined

        await user.save()

        return Response.json(
            { message: "Email is Verified Successfully." },
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            { message: "Verify Email Error.", error },
            { status: 500 }
        )
    }
}