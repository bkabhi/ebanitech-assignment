import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    const { name, email, phone, password } = await req.json();

    const updateData: any = { name, email, phone };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await User.findOneAndUpdate(
      { _id: id, role: "admin" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin updated", admin });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Delete the admin
    const admin = await User.findOneAndDelete({ _id: id, role: "admin" });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Optionally also delete users created by this admin
    await User.deleteMany({ createdBy: id, role: "user" });

    return NextResponse.json({ message: "Admin and associated users deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
