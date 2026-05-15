import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { Vehicle } from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "admin")
      return Response.json(
        { message: "Unauthorized access." },
        { status: 400 },
      );

    // Get all the counts
    const totalPartners = await User.countDocuments({ role: "partner" });
    const totalApprovedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });
    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "pending",
    });
    const totalRejectedPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    // Get pendig partners only with full data
    const pendingPartnerUsers = await User.find({
      role: "partner",
      partnerStatus: "pending",
      partnerOnBoardingSteps: { $gte: 3 },
    });

    // All the partners IDs
    const partnerIds = pendingPartnerUsers.map((p) => p._id);

    // Find Vehicle using partner IDs
    const parnterVehicles = await Vehicle.find({
      owner: { $in: partnerIds },
    });

    const vehicleTypeMap = new Map(
      parnterVehicles.map((v) => [String(v.owner), v.type]),
    );

    const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      vehicleType: vehicleTypeMap.get(String(p._id)),
    }));

    return NextResponse.json(
      {
        stats: {
          totalPartners,
          totalApprovedPartners,
          totalPendingPartners,
          totalRejectedPartners,
        },
        pendingPartnersReviews,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `ADMIN Dashboard error ${error}`,
      },
      { status: 500 },
    );
  }
}
