import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";

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
    const { title, content } = await req.json();

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: authUser.id },
      { $set: { title, content } },
      { new: true, runValidators: true }
    );

    if (!note) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note updated", note });
  } catch (error: any) {
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

    const note = await Note.findOneAndDelete({ _id: id, userId: authUser.id });

    if (!note) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
