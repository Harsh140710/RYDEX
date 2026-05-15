import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { PartnerBank } from "@/models/partnerBank.model";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email)
      return Response.json(
        { message: "Unauthorized access." },
        { status: 400 },
      );

    // Check user exist or not
    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return Response.json({ message: "User not found." }, { status: 404 });

    const { accountHolder, accountNumber, ifsc, mobileNumber, upi } =
      await req.json();
    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber)
      return Response.json(
        {
          message:
            "Account Holder Name, Account Number, IFSC code and Mobile Number is required.",
        },
        { status: 400 },
      );

    // find and update in same step
    const partnerBank = await PartnerBank.findOneAndUpdate(
      // find user with ID
      { owner: user._id },

      // insert partner bank details
      {
        accountHolder,
        accountNumber,
        ifsc,
        upi,
        status: "added",
      },

      // if not created than create it
      { upsert: true, new: true },
    );

    // Insert mobile number in user model
    user.mobileNumber = mobileNumber;

    // Increase partner on boarding step
    user.partnerOnBoardingSteps = 3;
    
    user.partnerStatus = "pending";

    await user.save();

    return Response.json(partnerBank, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Partner Bank error ${error}` },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email)
      return Response.json(
        { message: "Unauthorized access." },
        { status: 400 },
      );

    // Check user exist or not
    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return Response.json({ message: "User not found." }, { status: 404 });

    let partnerBank = await PartnerBank.findOne({ owner: user._id });
    if (partnerBank)
      return Response.json(
        { mobileNumber: user.mobileNumber, partnerBank },
        { status: 200 },
      );

    return null;
  } catch (error) {
    return Response.json(
      { message: `GET partner bank error ${error}` },
      { status: 500 },
    );
  }
}
