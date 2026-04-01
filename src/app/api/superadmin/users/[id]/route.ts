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
    const { name, email, phone, password, adminId } = await req.json();

    const updateData: any = { name, email, phone };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (adminId) {
      // Re-assign user to a different admin
      const adminUser = await User.findOne({ _id: adminId, role: "admin" });
      if (!adminUser) {
        return NextResponse.json({ error: "Provided admin ID is invalid" }, { status: 400 });
      }
      updateData.createdBy = adminId;
    }

    const user = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated", user });
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

    const user = await User.findOneAndDelete({ _id: id, role: "user" });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
