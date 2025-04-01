import prisma from "@/app/libs/prismadb";
import { safeFetch, isBuildTime } from "@/app/libs/db-build-helper";
import getSession from "./getSession";

const getCurrentUser = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    // Use our safeFetch utility to handle build-time vs runtime safely
    const currentUser = await safeFetch(
      // Actual database operation
      () => prisma.user.findUnique({
        where: { email: session.user.email },
      }),
      // Mock data returned during build
      isBuildTime() ? { 
        id: 0, 
        name: 'Build User', 
        email: session.user.email,
        emailVerified: new Date(),
        image: '',
        hashedPassword: '',
        createdAt: new Date(),
        updatedAt: new Date()
      } : null
    );

    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getCurrentUser;
