import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import { PartnerDocs } from "@/models/partnerDocs.model";
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

    // Get documents images from the user and it is must be form data
    const formdata = await req.formData();
    const aadhar = formdata.get("aadhar") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;

    if (!aadhar || !license || !rc)
      return Response.json(
        { message: "All documents are required." },
        { status: 400 },
      );

    // Update payload directly according model
    const updatePayload: any = {
      status: "pending",
    };

    // upload aadhar on cloudinary
    if (aadhar) {
      const url = await uploadOnCloudinary(aadhar);
      if (!url)
        return Response.json(
          { message: "Aadhar Card Upload failed." },
          { status: 500 },
        );

      updatePayload.aadharUrl = url;
    }

    // upload license on cloudinary
    if (license) {
      const url = await uploadOnCloudinary(license);
      if (!url)
        return Response.json(
          { message: "License Upload failde." },
          { status: 500 },
        );

      updatePayload.licenseUrl = url;
    }

    // upload rc book on cloudinary
    if (rc) {
      const url = await uploadOnCloudinary(rc);
      if (!url)
        return Response.json(
          { message: "RC book Upload failed." },
          { status: 500 },
        );

      updatePayload.rcUrl = url;
    }

    // find and update in same step
    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      // find with user id
      { owner: user._id },
      // set updated payload using piplines
      { $set: updatePayload },
      // if not exist then create it
      { upsert: true, new: true },
    );

    // increase partner on boarding step
    if (user.partnerOnBoardingSteps < 2) user.partnerOnBoardingSteps = 2;

    await user.save();

    return Response.json(partnerDocs, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: `Partner Document error ${error}` },
      { status: 500 },
    );
  }
}
