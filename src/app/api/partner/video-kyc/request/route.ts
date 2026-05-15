import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";

export async function GET() {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email)
      return Response.json(
        { message: "Unauthorized access." },
        { status: 400 },
      );

    // Check user exist or not
    const partner = await User.findOne({ email: session.user.email });
    if (!partner)
      return Response.json({ message: "Partner not found." }, { status: 404 });

    if (partner.videoKycStatus !== "rejected") {
      return Response.json(
        { message: "You can not send kyc request at this time." },
        { status: 400 },
      );
    }

    partner.videoKycStatus = "pending";
    partner.videoKycRejectionReason = undefined;
    partner.videoKycRoomId = undefined;

    await partner.save();

    return Response.json({ message: "Success." }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `KYC request Error ${error}` },
      { status: 500 },
    );
  }
}
