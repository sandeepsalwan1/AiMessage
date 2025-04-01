import { AuthOptions, getServerSession } from "next-auth";
import { isBuildTime } from "@/app/libs/db-build-helper";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function getSession() {
  // During build time, return a mock session to prevent database calls
  if (isBuildTime()) {
    console.warn('Build mode: Returning mock session');
    return {
      user: {
        email: 'build-user@example.com',
        name: 'Build User',
        image: '',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
  
  // During runtime, get the real session
  return await getServerSession(authOptions as AuthOptions);
}
