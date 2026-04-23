import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import { Vehicle } from "@/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

export async function POST(req: Request) {
  try {
    await connectDB();

    // Check session exist or not
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

    // Data comes from frontend
    const { type, number, vehicleModel } = await req.json();
    if (!type || !number || !vehicleModel)
      return Response.json(
        { message: "Missing Vehicle Type, Number and Vehicle Model." },
        { status: 400 },
      );

    // Check vehicle number format using REJEX
    if (!VEHICLE_REGEX.test(number))
      return Response.json(
        { message: "Invalid Vehicle Number Format ." },
        { status: 400 },
      );

    const vehicleNumber = number.toUpperCase();

    // Check vehicle number already exist or not
    const duplicate = await Vehicle.findOne({ number: vehicleNumber });
    if (duplicate)
      return Response.json(
        { message: "Vehicle Number Already Registered." },
        { status: 400 },
      );

    // Check vehicle updating or creating in one API
    let vehicle = await Vehicle.findOne({ owner: user._id });
    // Updating vehicle details
    if (vehicle) {
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";
      await vehicle.save();

      return Response.json(vehicle, { status: 200 });
    }

    // Creating new vehicle details
    vehicle = await Vehicle.create({
      owner: user._id,
      type,
      number: vehicleNumber,
      vehicleModel,
    });

    // Incrase on boarding validation steps
    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    // Update user roler USER to PARTNER
    user.role = "partner";
    await user.save();

    return Response.json(vehicle, { status: 201 });
  } catch (error) {
    console.log(error)
    return Response.json(
      { message: `Vehicle error ${error}` },
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

    let vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) return Response.json(vehicle, { status: 200 });

    return null;
  } catch (error) {
    return Response.json(
      { message: `GET Vehicle error ${error}` },
      { status: 500 },
    );
  }
}
