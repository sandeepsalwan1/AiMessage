import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    if (!socketId || !channel) {
      return new NextResponse("Missing socket_id or channel_name", { status: 400 });
    }

    console.log("Authorizing channel:", channel, "for socket:", socketId);
    
    // For presence channels, we need to include user data
    if (channel.startsWith('presence-')) {
      const authResponse = pusherServer.authorizeChannel(socketId, channel, {
        user_id: session.user.email,
        user_info: {
          name: session.user.name || 'Anonymous',
          email: session.user.email
        }
      });
      console.log("Auth response for presence channel:", authResponse);
      return NextResponse.json(authResponse);
    }
    
    // For regular channels
    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    console.log("Auth response for regular channel:", authResponse);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("PUSHER_AUTH_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 