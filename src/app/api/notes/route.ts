import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Note from "@/models/Note";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const userHeader = req.headers.get("x-user");
    if (!userHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authUser = JSON.parse(userHeader);

    // Pagination or search
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    const query: any = { userId: authUser.id };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ notes });
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

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const note = await Note.create({
      title,
      content,
      userId: authUser.id,
    });

    return NextResponse.json({ message: "Note created", note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
