import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const userHeader = req.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = JSON.parse(userHeader);

    // Searching and Pagination
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: any = { role: "user" };
    
    // Admins can only see users they created
    if (authUser.role === "admin") {
      query.createdBy = authUser.id;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const users = await User.find(query)
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
    
    const userHeader = req.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = JSON.parse(userHeader);

    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      createdBy: authUser.id,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: "User created", user: userResponse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
