import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.LIVEBLOCKS_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!secret) {
    return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
  }

  try {
    const { room } = await request.json();
    if (!room) return NextResponse.json({ error: "Room required" }, { status: 400 });

    const liveblocks = new Liveblocks({ secret });
    const userId = `user-${Math.random().toString(36).slice(2, 9)}`;
    
    const session = await liveblocks.prepareSession(userId, {
      userInfo: { name: `Player ${Math.random().toString(36).slice(2, 6)}` },
    });

    session.allow(room, session.FULL_ACCESS);
    const token = await session.authorize();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
