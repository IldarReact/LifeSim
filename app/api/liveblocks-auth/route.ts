import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  const { room } = await request.json();

  const session = {
    userId: `user-${Math.random().toString(36).slice(2, 9)}`,
    info: {
      name: `Player ${Math.random().toString(36).slice(2, 6)}`,
    },
  };

  const { body, status } = await liveblocks.identifyUser(
    {
      userId: session.userId,
      groupIds: [],
      userInfo: session.info,
    },
    { room }
  );

  return NextResponse.json(body, { status });
}
