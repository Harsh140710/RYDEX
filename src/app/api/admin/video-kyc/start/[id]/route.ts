import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "admin")
      return Response.json(
        { message: "Unauthorized access." },
        { status: 400 },
      );

    const partnerId = (await context.params).id;
    const partner = await User.findOne({ _id: partnerId });
    if (!partner || partner.role !== "partner") {
      return Response.json(
        {
          message: "Partner NOT found.",
        },
        { status: 404 },
      );
    }

    const roomId = `kyc-${partner._id}-${Date.now()}`;

    partner.videoKycRoomId = roomId;
    partner.videoKycStatus = "in_progress";
    partner.partnerOnBoardingSteps = 4;

    await partner.save();

    return NextResponse.json({ roomId }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        message: `VIDEO KYC STATUS ERROR ${error}`,
      },
      { status: 500 },
    );
  }
}
