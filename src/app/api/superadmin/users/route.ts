import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Pagination or search logic
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const adminId = searchParams.get("adminId");

    const query: any = { role: "user" };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (adminId) {
      query.createdBy = adminId;
    }

    const users = await User.find(query)
      .populate("createdBy", "name email")
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const { name, email, phone, password, adminId } = await req.json();

    if (!name || !email || !password || !adminId) {
      return NextResponse.json({ error: "Missing required fields, including adminId" }, { status: 400 });
    }

    // Check if the provided adminId is actually an admin
    const adminUser = await User.findOne({ _id: adminId, role: "admin" });
    if (!adminUser) {
      return NextResponse.json({ error: "Provided admin ID is invalid or not an admin" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      createdBy: adminId,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: "User created under admin", user: userResponse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
