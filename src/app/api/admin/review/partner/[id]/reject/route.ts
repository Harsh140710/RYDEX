import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { PartnerBank } from "@/models/partnerBank.model";
import { PartnerDocs } from "@/models/partnerDocs.model";
import { User } from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(
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

    const { rejectionReason } = await req.json();

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

    partner.partnerStatus = "rejected";
    partner.rejectionReason = rejectionReason;
    await partner.save();

    return Response.json(
      {
        message: "Partner Rejected successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: `Partner Rejected Error ${error}`,
      },
      { status: 500 },
    );
  }
}
