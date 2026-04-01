import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      return NextResponse.json(
        { message: "Super admin already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash("superadmin123", 10);

    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role: "superadmin",
    });

    return NextResponse.json(
      { message: "Super admin created successfully", user: superAdmin },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to setup super admin", details: error.message },
      { status: 500 }
    );
  }
}
