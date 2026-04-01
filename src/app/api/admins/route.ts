import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Pagination or search logic (bonus)
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    const query = { role: "admin", ...(search ? { name: { $regex: search, $options: "i" } } : {}) };

    const admins = await User.find(query).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ admins });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    // Extract superadmin logic via header (set by middleware)
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

    const admin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      createdBy: authUser.id,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return NextResponse.json({ message: "Admin created", admin: adminResponse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
