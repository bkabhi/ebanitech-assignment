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

    const userHeader = req.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = JSON.parse(userHeader);

    const { id } = params;
    const { name, email, phone, password } = await req.json();

    const updateData: any = { name, email, phone };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const query: any = { _id: id, role: "user" };
    // If it's an admin making the request, ensure they own the user
    // A superadmin would be using /api/superadmin/users to edit any user, 
    // but if they use this route, we might allow it generically if we want,
    // but our middleware enforces admin or superadmin. Let's strictly scope to creator.
    if (authUser.role === "admin") {
      query.createdBy = authUser.id;
    }

    const user = await User.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found or unauthorized" }, { status: 404 });
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

    const userHeader = req.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = JSON.parse(userHeader);

    const { id } = params;

    const query: any = { _id: id, role: "user" };
    if (authUser.role === "admin") {
      query.createdBy = authUser.id;
    }

    const user = await User.findOneAndDelete(query);

    if (!user) {
      return NextResponse.json({ error: "User not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
