# .eslintrc.json

```json
{
  "extends": "next/core-web-vitals"
}

```

# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/(site)/components/AuthForm.tsx

```tsx
"use client";

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BsGithub, BsGoogle } from "react-icons/bs";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import AuthSocialButton from "./AuthSocialButton";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session.status === "authenticated") {
      toast.success("Logged in!");
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (!data) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() => {
          signIn("credentials", data);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong!");
        });
    }

    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      }).then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials!");
        }
        if (callback?.ok && !callback?.error) {
          toast.success("Logged in!");
          router.push("/users");
        }
      });
    }

    setIsLoading(false);
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, {
      redirect: false,
    }).then((callback) => {
      if (callback?.error) {
        toast.error("Something went wrong!");
      }
      if (callback?.ok && !callback?.error) {
        toast.success("Logged in!");
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && <Input id="name" label="Name" register={register} errors={errors} />}
          <Input id="email" label="Email" type="email" register={register} errors={errors} />
          <Input id="password" label="Password" type="password" register={register} errors={errors} />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton icon={BsGithub} onClick={() => socialAction("github")} />
            <AuthSocialButton icon={BsGoogle} onClick={() => socialAction("google")} />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>{variant === "LOGIN" ? "Don't have an account?" : "Already have an account?"}</div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Register" : "Sign in"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

```

# app/(site)/components/AuthSocialButton.tsx

```tsx
import { FC } from "react";
import { IconType } from "react-icons";

interface AuthSocialButtonProps {
  icon: IconType;
  onClick: () => void;
}

const AuthSocialButton: FC<AuthSocialButtonProps> = ({ icon: Icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
    >
      <Icon />
    </button>
  );
};

export default AuthSocialButton;

```

# app/(site)/page.tsx

```tsx
import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image alt="logo" src="/images/logo.png" width={48} height={48} className="mx-auto w-auto" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
      </div>
      <AuthForm />
    </div>
  );
}

```

# app/actions/getConversationById.ts

```ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversationById = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return null;
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!conversation) {
      return null;
    }

    return conversation;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default getConversationById;

```

# app/actions/getConversations.ts

```ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id || !currentUser?.email) {
    return [];
  }

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        userIds: {
          has: currentUser.id,
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    });

    return conversations;
  } catch (error) {
    console.log("[CONVERSATIONS_ERROR]", error);
    return [];
  }
};

export default getConversations;

```

# app/actions/getCurrentUser.ts

```ts
import prisma from "@/app/libs/prismadb";

import getSession from "./getSession";

const getCurrentUser = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

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

```

# app/actions/getMessages.ts

```ts
import prisma from "@/app/libs/prismadb";

const getMessages = async (conversationId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: true,
        seen: true,
      },
    });

    if (!messages) {
      return [];
    }

    return messages;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getMessages;

```

# app/actions/getSession.ts

```ts
import { AuthOptions, getServerSession } from "next-auth";

import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function getSession() {
  return await getServerSession(authOptions as AuthOptions);
}

```

# app/actions/getUsers.ts

```ts
import prisma from "@/app/libs/prismadb";

import getSession from "./getSession";

const getUsers = async () => {
  const session = await getSession();

  if (!session?.user?.email) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });

    if (!users) {
      return [];
    }

    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export default getUsers;

```

# app/api/auth/[...nextauth]/route.ts

```ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import brcypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/app/libs/prismadb";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await brcypt.compare(credentials.password, user.hashedPassword);

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as AuthOptions);

export { handler as GET, handler as POST };

```

# app/api/conversations/[conversationId]/route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  conversationId?: string;
}

export default async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: IParams;
  }
) {
  try {
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    conversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:remove", conversation);
      }
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.log("[CONVERSATION_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

```

# app/api/conversations/[conversationId]/seen/route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  conversationId?: string;
}

export async function POST(req: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      lastMessage: [updatedMessage],
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    await pusherServer.trigger(conversationId!, "message:update", updatedMessage);

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log("[MESSAGE_SEEN_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

```

# app/api/conversations/route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    const existingConversation = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
        ],
      },
    });

    const singleConversation = existingConversation[0];

    if (singleConversation) {
      return NextResponse.json(singleConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.log("[CONVERSATIONS_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

```

# app/api/messages/route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();

    const { message, image, conversationId } = body;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        sender: true,
        seen: true,
      },
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: updatedConversation.id,
        messages: [lastMessage],
      });
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.log("[MESSAGES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

```

# app/api/register/route.ts

```ts
import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields.", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTRATION_ERROR]", error);
    return new NextResponse("Error while registering user.", { status: 500 });
  }
}

```

# app/api/settings/route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { name, image } = body;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("[SETTINGS_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

```

# app/components/ActiveStatus.tsx

```tsx
"use client";

import useActiveChannel from "../hooks/useActiveChannel";

const ActiveStatus = () => {
  useActiveChannel();
  return null;
};

export default ActiveStatus;

```

# app/components/avatar.tsx

```tsx
"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import { FC } from "react";

import useActiveList from "../hooks/useActiveList";

interface AvatarProps {
	user?: User;
}

const Avatar: FC<AvatarProps> = ({ user }) => {
	const { members } = useActiveList();
	const isActive = members.indexOf(user?.email!) !== -1;

	return (
		<div className="relative">
			<div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
				<Image
					alt="Avatar"
					src={user?.image || "/images/placeholder.jpg"}
					fill
				/>
			</div>
			{isActive && (
				<span className="absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:h-3 md:w-3" />
			)}
		</div>
	);
};

export default Avatar;

```

# app/components/AvatarGroup.tsx

```tsx
"use client";

import { User } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { FC } from "react";

interface AvatarGroupProps {
  users?: User[];
}

const AvatarGroup: FC<AvatarGroupProps> = ({ users = [] }) => {
  const slicedUsers = users.slice(0, 3);

  const positionMap = {
    0: "top-0 left-[12px]",
    1: "bottom-0",
    2: "bottom-0 right-0",
  };

  return (
    <div className="relative h-11 w-11">
      {slicedUsers.map((user, index) => (
        <div
          key={user.id}
          className={clsx(
            "absolute inline-block rounded-full overflow-hidden h-[21px] w-[21px]",
            positionMap[index as keyof typeof positionMap]
          )}
        >
          <Image src={user?.image || "/images/placeholder.jpg"} alt="Avatar" fill />
        </div>
      ))}
    </div>
  );
};

export default AvatarGroup;

```

# app/components/Button.tsx

```tsx
"use client";

import clsx from "clsx";
import { FC } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ type, fullWidth, children, onClick, secondary, danger, disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        disabled && "opacity-50 cursor-default",
        fullWidth && "w-full",
        secondary ? "text-gray-900" : "text-white",
        danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600",
        !secondary && !danger && "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600"
      )}
    >
      {children}
    </button>
  );
};

export default Button;

```

# app/components/EmptyState.tsx

```tsx
const EmptyState = () => {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 h-full flex items-center justify-center bg-gray-100">
      <div className="text-center items-center flex flex-col">
        <h3 className="mt-2 text-2xl font-semibold text-gray-500">Select a chat or start a new conversation</h3>
      </div>
    </div>
  );
};

export default EmptyState;

```

# app/components/inputs/Input.tsx

```tsx
"use client";

import clsx from "clsx";
import { FC } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  disabled?: boolean;
}

const Input: FC<InputProps> = ({ label, id, type, required, register, errors, disabled }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          className={clsx(
            "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6",
            errors[id] && "focus:ring-rose-500",
            disabled && "opacity-50 cursor-default"
          )}
        />
      </div>
    </div>
  );
};

export default Input;

```

# app/components/inputs/Select.tsx

```tsx
"use client";

import { FC } from "react";
import ReactSelect from "react-select";

interface SelectProps {
  label: string;
  value?: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  options: Record<string, any>[];
  disabled?: boolean;
}

const Select: FC<SelectProps> = ({ label, value, onChange, options, disabled }) => {
  return (
    <div className="z-[100]">
      <label className="block text-sm font-medium leading-6 text-gray-900">{label}</label>
      <div className="mt-2">
        <ReactSelect
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          options={options}
          isMulti
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          classNames={{
            control: () => "text-sm",
          }}
        />
      </div>
    </div>
  );
};

export default Select;

```

# app/components/LoadingModal.tsx

```tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";

const LoadingModal = () => {
  return (
    <Transition.Root show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-100 bg-opacity-50 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full justify-center items-center p-4 text-center">
            <Dialog.Panel>
              <ClipLoader size={40} color="#0284c7" />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LoadingModal;

```

# app/components/Modal.tsx

```tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment } from "react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center p-4 sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 text-left shadow-xl transition-all w-full sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pt-4 pr-4 sm:block z-10">
                  <button
                    onClick={onClose}
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <IoClose size={24} className="h-6 w-6" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;

```

# app/components/sidebar/DesktopItem.tsx

```tsx
"use client";

import clsx from "clsx";
import Link from "next/link";
import { FC } from "react";

interface DesktopItemProps {
  label: string;
  icon: any;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const DesktopItem: FC<DesktopItemProps> = ({ label, icon: Icon, href, active, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };

  return (
    <li onClick={handleClick}>
      <Link
        href={href}
        className={clsx(
          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-500 hover:text-black hover:bg-gray-100",
          active && "bg-gray-100 text-black"
        )}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem;

```

# app/components/sidebar/DesktopSidebar.tsx

```tsx
"use client";

import { User } from "@prisma/client";

import useRoutes from "@/app/hooks/useRoutes";
import { FC, useState } from "react";
import Avatar from "../avatar";
import DesktopItem from "./DesktopItem";
import SettingsModal from "./SettingsModal";

interface DesktopSidebarProps {
	currentUser: User;
}

const DesktopSidebar: FC<DesktopSidebarProps> = ({ currentUser }) => {
	const routes = useRoutes();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<SettingsModal
				currentUser={currentUser}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
			<div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-y-auto lg:bg-white lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
				<nav className="mt-4 flex flex-col justify-between">
					<ul role="list" className="flex flex-col items-center space-y-1">
						{routes.map((route) => (
							<DesktopItem
								key={route.label}
								href={route.href}
								label={route.label}
								icon={route.icon}
								active={route.active}
								onClick={route.onClick}
							/>
						))}
					</ul>
				</nav>
				<nav className="mt-4 flex flex-col justify-between items-center">
					<div
						onClick={() => setIsOpen(true)}
						className="cursor-pointer hover:opacity-75 transition"
					>
						<Avatar user={currentUser} />
					</div>
				</nav>
			</div>
		</>
	);
};

export default DesktopSidebar;

```

# app/components/sidebar/MobileFooter.tsx

```tsx
"use client";

import useConversation from "@/app/hooks/useConversation";
import useRoutes from "@/app/hooks/useRoutes";
import MobileItem from "./MobileItem";

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-white border-t-[1px] lg:hidden">
      {routes.map((route) => (
        <MobileItem
          label={route.label}
          key={route.href}
          href={route.href}
          icon={route.icon}
          onClick={route.onClick}
          active={route.active}
        />
      ))}
    </div>
  );
};

export default MobileFooter;

```

# app/components/sidebar/MobileItem.tsx

```tsx
"use client";

import clsx from "clsx";
import Link from "next/link";
import { FC } from "react";

interface MobileItemProps {
  label: string;
  icon: any;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const MobileItem: FC<MobileItemProps> = ({ label, icon: Icon, href, active, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={clsx(
        "group flex gap-x-3 leading-6 text-sm font-semibold w-full justify-center p-4 text-gray-500 hover:text-black hover:bg-gray-100",
        active && "bg-gray-100 text-black"
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
};

export default MobileItem;

```

# app/components/sidebar/SettingsModal.tsx

```tsx
"use client";

import { User } from "@prisma/client";
import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Button from "../Button";
import Modal from "../Modal";
import Input from "../inputs/Input";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: currentUser?.image,
    },
  });

  const image = watch("image");

  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/settings", data)
      .then(() => {
        router.refresh();
        onClose();
        toast.success("Settings updated");
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Edit you public information</p>

            <div className="mt-10 flex flex-col gap-y-8">
              <Input disabled={isLoading} label="Name" id="name" errors={errors} required register={register} />
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">Photo</label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    src={image || currentUser?.image || "/images/placeholder.jpg"}
                    alt="avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <CldUploadButton
                    options={{
                      maxFiles: 1,
                    }}
                    onUpload={handleUpload}
                    uploadPreset="weopayd7"
                  >
                    <Button disabled={isLoading} secondary type="button">
                      Change
                    </Button>
                  </CldUploadButton>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button disabled={isLoading} secondary type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit" onClick={onClose}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;

```

# app/components/sidebar/Sidebar.tsx

```tsx
import getCurrentUser from "@/app/actions/getCurrentUser";
import DesktopSidebar from "./DesktopSidebar";
import MobileFooter from "./MobileFooter";

export default async function Sidebar({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="h-full">
      <DesktopSidebar currentUser={currentUser!} />
      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
}

```

# app/context/AuthContext.tsx

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

interface AuthContextProps {
  children: React.ReactNode;
}

export default function AuthContext({ children }: AuthContextProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

```

# app/context/ToasterContext.tsx

```tsx
"use client";

import { Toaster } from "react-hot-toast";

const ToasterContext = () => {
  return <Toaster />;
};

export default ToasterContext;

```

# app/conversations/[conversationId]/components/Body.tsx

```tsx
"use client";

import useConversation from "@/app/hooks/useConversation";
import { pusherClient } from "@/app/libs/pusher";
import { FullMessageType } from "@/app/types";
import axios from "axios";
import { find } from "lodash";
import { FC, useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((messages) => {
        if (find(messages, { id: message.id })) {
          return messages;
        }

        return [...messages, message];
      });

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const updateMessageHandler = (message: FullMessageType) => {
      setMessages((current) =>
        current.map((m) => {
          if (m.id === message.id) {
            return message;
          }

          return m;
        })
      );
    };

    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageBox isLast={index === messages.length - 1} key={message.id} message={message} />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;

```

# app/conversations/[conversationId]/components/ConfirmModal.tsx

```tsx
"use client";

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import useConversation from "@/app/hooks/useConversation";
import { Dialog } from "@headlessui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = useCallback(() => {
    setIsLoading(true);

    axios
      .delete(`/api/conversations/${conversationId}`)
      .then(() => {
        onClose();
        toast.success("Conversation deleted");
        router.push("/conversations");
        router.refresh();
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  }, [conversationId, onClose, router]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-black">
          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
            Delete conversation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Are you sure you want to delete this conversation? This action cannot be undone.</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button disabled={isLoading} danger onClick={handleDelete}>
          Delete
        </Button>
        <Button disabled={isLoading} secondary onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

```

# app/conversations/[conversationId]/components/Form.tsx

```tsx
"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";

import MessageInput from "./MessageInput";

const Form = () => {
  const { conversationId } = useConversation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true });

    axios.post("/api/messages", {
      ...data,
      conversationId,
    });
  };

  const handleUpload = (result: any) => {
    axios.post("/api/messages", {
      image: result?.info?.secure_url,
      conversationId,
    });
  };

  return (
    <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
        options={{
          maxFiles: 1,
        }}
        onUpload={handleUpload}
        uploadPreset="weopayd7"
      >
        <HiPhoto size={30} className="text-sky-500" />
      </CldUploadButton>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 lg:gap-4 w-full">
        <MessageInput id="message" register={register} errors={errors} required placeholder="Write a message" />
        <button type="submit" className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition">
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default Form;

```

# app/conversations/[conversationId]/components/Header.tsx

```tsx
"use client";

import AvatarGroup from "@/app/components/AvatarGroup";
import Avatar from "@/app/components/avatar";
import useActiveList from "@/app/hooks/useActiveList";
import useOtherUser from "@/app/hooks/useOtherUser";
import { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2";
import ProfileDrawer from "./ProfileDrawer";

interface HeaderProps {
	conversation: Conversation & {
		users: User[];
	};
}

const Header: FC<HeaderProps> = ({ conversation }) => {
	const otherUser = useOtherUser(conversation);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { members } = useActiveList();
	const isActive = members.indexOf(otherUser?.email!) !== -1;

	const statusText = useMemo(() => {
		if (conversation.isGroup) {
			return `${conversation.users.length} members`;
		}

		return isActive ? "Active" : "Offline";
	}, [conversation, isActive]);

	return (
		<>
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				data={conversation}
			/>
			<div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
				<div className="flex gap-3 items-center">
					<Link
						href="/conversations"
						className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer"
					>
						<HiChevronLeft size={32} />
					</Link>
					{conversation.isGroup ? (
						<AvatarGroup users={conversation.users} />
					) : (
						<Avatar user={otherUser} />
					)}
					<div className="flex flex-col">
						<div>{conversation?.name || otherUser?.name}</div>
						<div className="text-sm font-light text-neutral-500">
							{statusText}
						</div>
					</div>
				</div>
				<HiEllipsisHorizontal
					size={32}
					onClick={() => setDrawerOpen(true)}
					className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
				/>
			</div>
		</>
	);
};

export default Header;

```

# app/conversations/[conversationId]/components/ImageModal.tsx

```tsx
"use client";

import Modal from "@/app/components/Modal";
import Image from "next/image";
import { FC } from "react";

interface ImageModalProps {
  src?: string | null;
  onClose: () => void;
  isOpen?: boolean;
}

const ImageModal: FC<ImageModalProps> = ({ src, onClose, isOpen }) => {
  if (!src) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 h-80">
        <Image src={src} alt="Image" fill className="object-cover" />
      </div>
    </Modal>
  );
};

export default ImageModal;

```

# app/conversations/[conversationId]/components/MessageBox.tsx

```tsx
"use client";

import Avatar from "@/app/components/avatar";
import { FullMessageType } from "@/app/types";
import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FC, useState } from "react";
import ImageModal from "./ImageModal";

interface MessageBoxProps {
	isLast: boolean;
	message: FullMessageType;
}

const MessageBox: FC<MessageBoxProps> = ({ isLast, message }) => {
	const session = useSession();
	const [imageModalOpen, setImageModalOpen] = useState(false);

	const isOwn = session?.data?.user?.email === message?.sender?.email;
	const seenList = (message?.seen || [])
		.filter((user) => user.email !== message?.sender?.email)
		.map((user) => user.name)
		.join(", ");

	const container = clsx("flex gap-3 p-4", isOwn && "justify-end");

	const avatar = clsx(isOwn && "order-2");

	const body = clsx("flex flex-col gap-2", isOwn && "items-end");

	const messageContainer = clsx(
		"text-sm w-fit overflow-hidden",
		isOwn ? "text-white bg-sky-500" : "bg-gray-100",
		message?.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
	);

	return (
		<div className={container}>
			<div className={avatar}>
				<Avatar user={message?.sender} />
			</div>
			<div className={body}>
				<div className="flex items-center gap-1">
					<div className="text-sm text-gray-500">{message?.sender?.name}</div>
					<div className="text-xs text-gray-400">
						{format(new Date(message?.createdAt), "p")}
					</div>
				</div>
				<div className={messageContainer}>
					<ImageModal
						src={message?.image}
						isOpen={imageModalOpen}
						onClose={() => setImageModalOpen(false)}
					/>
					{message?.image ? (
						<Image
							onClick={() => setImageModalOpen(true)}
							alt="Image"
							height={288}
							width={288}
							src={message?.image}
							className="object-cover cursor-pointer hover:scale-110 transition translate"
						/>
					) : (
						<div>{message?.body}</div>
					)}
				</div>
				{isLast && isOwn && seenList.length > 0 && (
					<div className="text-xs font-light text-gray-500">{`Seen by ${seenList}`}</div>
				)}
			</div>
		</div>
	);
};

export default MessageBox;

```

# app/conversations/[conversationId]/components/MessageInput.tsx

```tsx
"use client";

import { FC } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface MessageInputProps {
  placeholder?: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const MessageInput: FC<MessageInputProps> = ({ placeholder, id, type, required, register, errors }) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        autoComplete={id}
        placeholder={placeholder}
        className="text-black font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white"
        {...register(id, { required })}
      />
    </div>
  );
};

export default MessageInput;

```

# app/conversations/[conversationId]/components/ProfileDrawer.tsx

```tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Conversation, User } from "@prisma/client";
import { format } from "date-fns";
import { FC, Fragment, useMemo, useState } from "react";
import { IoClose, IoTrash } from "react-icons/io5";

import AvatarGroup from "@/app/components/AvatarGroup";
import Avatar from "@/app/components/avatar";
import useActiveList from "@/app/hooks/useActiveList";
import useOtherUser from "@/app/hooks/useOtherUser";
import ConfirmModal from "./ConfirmModal";

interface ProfileDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	data: Conversation & {
		users: User[];
	};
}

const ProfileDrawer: FC<ProfileDrawerProps> = ({ isOpen, onClose, data }) => {
	const otherUser = useOtherUser(data);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const { members } = useActiveList();
	const isActive = members.indexOf(otherUser?.email!) !== -1;

	const joinedDate = useMemo(() => {
		return format(new Date(otherUser?.createdAt!), "PP");
	}, [otherUser?.createdAt]);

	const title = useMemo(() => {
		return data?.name || otherUser?.name;
	}, [data.name, otherUser?.name]);

	const statusText = useMemo(() => {
		if (data.isGroup) {
			return `${data.users.length} members`;
		}

		return isActive ? "Active" : "Offline";
	}, [data, isActive]);

	return (
		<>
			<ConfirmModal
				isOpen={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			/>
			<Transition.Root show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={onClose}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-500"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-500"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-40 " />
					</Transition.Child>
					<div className="fixed inset-0 overflow-hidden">
						<div className="absolute inset-0 overflow-hidden">
							<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
								<Transition.Child
									as={Fragment}
									enter="transform transition ease-in-out duration-500 sm:duration-700"
									enterFrom="translate-x-full"
									enterTo="translate-x-0"
									leave="transform transition ease-in-out duration-500 sm:duration-700"
									leaveFrom="translate-x-0"
									leaveTo="translate-x-full"
								>
									<Dialog.Panel className="pointer-events-auto w-screen max-w-md">
										<div className="h-full flex flex-col bg-white shadow-xl py-6 overflow-y-scroll">
											<div className="px-4 sm:px-6">
												<div className="flex items-start justify-end">
													<div className="ml-3 flex h-7 items-center">
														<button
															type="button"
															className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
															onClick={onClose}
														>
															<span className="sr-only">Close panel</span>
															<IoClose size={24} />
														</button>
													</div>
												</div>
											</div>
											<div className="relative mt-6 flex-1 px-4 sm:px-6">
												<div className="flex flex-col items-center">
													<div className="mb-2">
														{data.isGroup ? (
															<AvatarGroup users={data.users} />
														) : (
															<Avatar user={otherUser} />
														)}
													</div>
													<div>{title}</div>
													<div className="text-sm text-gray-500">
														{statusText}
													</div>
													<div className="flex gap-10 my-8">
														<div
															onClick={() => setConfirmOpen(true)}
															className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75"
														>
															<div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
																<IoTrash size={20} />
															</div>
															<div className="text-sm font-light text-neutral-600">
																Delete
															</div>
														</div>
													</div>
													<div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
														<dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
															{data.isGroup && (
																<div>
																	<dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
																		Emails
																	</dt>
																	<dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
																		{data.users
																			.map((user) => user.email)
																			.join(", ")}
																	</dd>
																</div>
															)}
															{!data.isGroup && (
																<div>
																	<dt className="text-sm font-medium text-gray-500 sm:flex-shrink-0 sm:w-40">
																		Email
																	</dt>
																	<dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
																		{otherUser?.email}
																	</dd>
																</div>
															)}
															{!data.isGroup && (
																<>
																	<hr />
																	<div>
																		<dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0">
																			Joined
																		</dt>
																		<dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
																			<time dateTime={joinedDate}>
																				{joinedDate}
																			</time>
																		</dd>
																	</div>
																</>
															)}
														</dl>
													</div>
												</div>
											</div>
										</div>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
};

export default ProfileDrawer;

```

# app/conversations/[conversationId]/page.tsx

```tsx
import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";
import EmptyState from "@/app/components/EmptyState";
import Body from "./components/Body";
import Form from "./components/Form";
import Header from "./components/Header";

interface IParams {
	conversationId: string;
}

const ChatId = async ({ params }: { params: IParams }) => {
	const conversation = await getConversationById(params.conversationId);
	const messages = await getMessages(params.conversationId);

	if (!conversation) {
		return (
			<div className="lg:pl-80 h-full">
				<div className="h-full flex flex-col">
					<EmptyState />
				</div>
			</div>
		);
	}

	return (
		<div className="lg:pl-80 h-full">
			<div className="h-full flex flex-col">
				<Header conversation={conversation} />
				<Body initialMessages={messages} />
				<Form />
			</div>
		</div>
	);
};

export default ChatId;

```

# app/conversations/components/ConversationBox.tsx

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo } from "react";

import Avatar from "@/app/components/avatar";
import AvatarGroup from "@/app/components/AvatarGroup";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import clsx from "clsx";
import { format } from "date-fns";

interface ConversationBoxProps {
	conversation: FullConversationType;
	selected: boolean;
}

const ConversationBox: FC<ConversationBoxProps> = ({
	conversation,
	selected,
}) => {
	const otherUser = useOtherUser(conversation);
	const session = useSession();
	const router = useRouter();

	const handleClick = useCallback(() => {
		router.push(`/conversations/${conversation.id}`);
	}, [conversation.id, router]);

	const lastMessage = useMemo(() => {
		const messages = conversation.messages || [];

		return messages[messages.length - 1];
	}, [conversation.messages]);

	const userEmail = useMemo(() => {
		return session.data?.user?.email;
	}, [session.data]);

	const hasSeen = useMemo(() => {
		if (!lastMessage) {
			return false;
		}

		const seen = lastMessage.seen || [];

		if (!userEmail) {
			return false;
		}

		return seen.filter((user) => user.email === userEmail).length !== 0;
	}, [userEmail, lastMessage]);

	const lastMessageText = useMemo(() => {
		if (lastMessage?.image) {
			return "Sent an image";
		}

		if (lastMessage?.body) {
			return lastMessage.body;
		}

		return "Start a conversation";
	}, [lastMessage]);

	return (
		<div
			onClick={handleClick}
			className={clsx(
				"w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3",
				selected ? "bg-neutral-100" : "bg-white"
			)}
		>
			{conversation.isGroup ? (
				<AvatarGroup users={conversation.users} />
			) : (
				<Avatar user={otherUser} />
			)}
			<div className="min-w-0 flex-1">
				<div className="focus:outline-none">
					<div className="flex justify-between items-center mb-1">
						<p className="text-md font-medium text-gray-900">
							{conversation?.name || otherUser?.name}
						</p>
						{lastMessage?.createdAt && (
							<p className="text-xs text-gray-400 font-light">
								{format(new Date(lastMessage.createdAt), "p")}
							</p>
						)}
					</div>
					<p
						className={clsx(
							"truncate text-sm",
							hasSeen ? "text-gray-500" : "text-black font-medium"
						)}
					>
						{lastMessageText}
					</p>
				</div>
			</div>
		</div>
	);
};

export default ConversationBox;

```

# app/conversations/components/ConversationList.tsx

```tsx
"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";

import useConversation from "@/app/hooks/useConversation";
import { pusherClient } from "@/app/libs/pusher";
import { FullConversationType } from "@/app/types";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";

interface ConversationListProps {
  conversations: FullConversationType[];
  users: User[];
}

const ConversationList: FC<ConversationListProps> = ({ conversations, users }) => {
  const session = useSession();
  const [items, setItems] = useState<FullConversationType[]>(conversations);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  const { conversationId, isOpen } = useConversation();

  const pusherKey = useMemo(() => {
    return session?.data?.user?.email;
  }, [session?.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (current.find((item) => item.id === conversation.id)) {
          return current;
        }

        return [conversation, ...current];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((item) => {
          if (item.id === conversation.id) {
            return {
              ...item,
              messages: conversation.messages,
            };
          }

          return item;
        })
      );
    };

    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => current.filter((item) => item.id !== conversation.id));
      if (conversationId === conversation.id) {
        router.push("/conversations");
      }
    };

    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", newHandler);
    pusherClient.bind("conversation:remove", removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind("conversation:new", updateHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:remove", removeHandler);
    };
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <GroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} />
      <aside
        className={clsx(
          "fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200",
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox key={item.id} conversation={item} selected={conversationId === item.id} />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;

```

# app/conversations/components/GroupChatModal.tsx

```tsx
"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import Select from "@/app/components/inputs/Select";
import Modal from "@/app/components/Modal";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

const GroupChatModal: FC<GroupChatModalProps> = ({ isOpen, onClose, users }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/conversations", {
        ...data,
        isGroup: true,
      })
      .then(() => {
        router.refresh();
        onClose();
        toast.success("Group created");
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="borer-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Create a group</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Groups are where your team communicates.</p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input register={register} label="Group name" id="name" disabled={isLoading} required errors={errors} />
              <Select
                disabled={isLoading}
                label="Members"
                options={users.map((user) => ({
                  label: user.name,
                  value: user.id,
                }))}
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                }
                value={members}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-x-6 justify-end">
          <Button disabled={isLoading} secondary onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal;

```

# app/conversations/layout.tsx

```tsx
import getConversations from "../actions/getConversations";
import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import ConversationList from "./components/ConversationList";

export default async function ConversationsLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList conversations={conversations} users={users} />
        {children}
      </div>
    </Sidebar>
  );
}

```

# app/conversations/loading.tsx

```tsx
import LoadingModal from "../components/LoadingModal";

const Loading = () => {
  return <LoadingModal />;
};

export default Loading;

```

# app/conversations/page.tsx

```tsx
"use client";

import clsx from "clsx";
import EmptyState from "../components/EmptyState";
import useConversation from "../hooks/useConversation";

const Home = () => {
  const { isOpen } = useConversation();

  return (
    <div className={clsx("lg:pl-80 h-full lg:block", isOpen ? "block" : "hidden")}>
      <EmptyState />
    </div>
  );
};

export default Home;

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
:root {
  height: 100%;
}

```

# app/hooks/useActiveChannel.ts

```ts
import { Channel, Members } from "pusher-js";
import { useEffect, useState } from "react";
import { pusherClient } from "../libs/pusher";
import useActiveList from "./useActiveList";

const useActiveChannel = () => {
  const { set, remove, add } = useActiveList();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    let channel = activeChannel;

    if (!channel) {
      channel = pusherClient.subscribe("presence-messenger");
      setActiveChannel(channel);
    }

    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      const initialMembers: string[] = [];

      members.each((member: Record<string, any>) => initialMembers.push(member.id));
      set(initialMembers);
    });

    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id);
    });

    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id);
    });

    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe("presence-messenger");
        setActiveChannel(null);
      }
    };
  }, [activeChannel, add, remove, set]);
};

export default useActiveChannel;

```

# app/hooks/useActiveList.ts

```ts
import { create } from "zustand";

interface ActiveListStore {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
}

const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (id) => set((state) => ({ members: [...state.members, id] })),
  remove: (id) => set((state) => ({ members: state.members.filter((member) => member !== id) })),
  set: (ids) => set(() => ({ members: ids })),
}));

export default useActiveList;

```

# app/hooks/useConversation.ts

```ts
import { useParams } from "next/navigation";
import { useMemo } from "react";

const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      return "";
    }

    return params?.conversationId as string;
  }, [params?.conversationId]);

  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(() => ({ conversationId, isOpen }), [conversationId, isOpen]);
};

export default useConversation;

```

# app/hooks/useOtherUser.ts

```ts
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { FullConversationType } from "../types";

const useOtherUser = (conversation: FullConversationType | { users: User[] }) => {
  const session = useSession();
  const otherUser = useMemo(() => {
    const currentUserEmail = session?.data?.user?.email;

    const otherUser = conversation.users.find((user) => user.email !== currentUserEmail);

    return otherUser;
  }, [conversation.users, session?.data?.user?.email]);

  return otherUser;
};

export default useOtherUser;

```

# app/hooks/useRoutes.ts

```ts
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";

import useConversation from "./useConversation";

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(
    () => [
      {
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathname === "/users",
      },
      {
        label: "Logout",
        href: "#",
        icon: HiArrowLeftOnRectangle,
        onClick: () => signOut(),
      },
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;

```

# app/layout.tsx

```tsx
import { Inter } from "next/font/google";

import AuthContext from "./context/AuthContext";
import ToasterContext from "./context/ToasterContext";

import ActiveStatus from "./components/ActiveStatus";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Messenger Clone",
  description: "Messenger Clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
          <ToasterContext />
          <ActiveStatus />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}

```

# app/libs/prismadb.ts

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;

```

# app/libs/pusher.ts

```ts
import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  channelAuthorization: {
    endpoint: "/api/pusher/auth",
    transport: "ajax",
  },
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

```

# app/types/index.ts

```ts
import { Conversation, Message, User } from "@prisma/client";

export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

```

# app/users/components/UserBox.tsx

```tsx
"use client";

import Avatar from "@/app/components/avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useState } from "react";

interface UserBoxProps {
	user: User;
}

const UserBox: FC<UserBoxProps> = ({ user }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = useCallback(() => {
		setIsLoading(true);

		axios
			.post("/api/conversations", {
				userId: user.id,
			})
			.then((res) => {
				router.push(`/conversations/${res.data.id}`);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [user, router]);

	return (
		<>
			{isLoading && <LoadingModal />}
			<div
				onClick={handleClick}
				className="w-full relative flex items-center space-x-3 bg-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
			>
				<Avatar user={user} />
				<div className="min-w-0 flex-1">
					<div className="focus:outline-none">
						<div className="flex justify-between items-center mb-1">
							<p className="text-sm font-medium text-gray-900">{user.name}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default UserBox;

```

# app/users/components/UserList.tsx

```tsx
"use client";

import { User } from "@prisma/client";
import { FC } from "react";
import UserBox from "./UserBox";

interface UserListProps {
  users: User[];
}

const UserList: FC<UserListProps> = ({ users }) => {
  return (
    <aside className="fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200 block w-full left-0">
      <div className="px-5">
        <div className="flex-col">
          <div className="text-2xl font-bold text-neutral-800 py-4">People</div>
        </div>
        {users.map((user) => (
          <UserBox key={user.id} user={user} />
        ))}
      </div>
    </aside>
  );
};

export default UserList;

```

# app/users/layout.tsx

```tsx
import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import UserList from "./components/UserList";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <UserList users={users} />
        {children}
      </div>
    </Sidebar>
  );
}

```

# app/users/loading.tsx

```tsx
import LoadingModal from "../components/LoadingModal";

const Loading = () => {
  return <LoadingModal />;
};

export default Loading;

```

# app/users/page.tsx

```tsx
import EmptyState from "../components/EmptyState";

const Users = () => {
  return (
    <div className="hidden lg:block lg:pl-80 h-full">
      <EmptyState />
    </div>
  );
};

export default Users;

```

# middleware.ts

```ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: ["/users/:path*", "/conversations/:path*"],
};

```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/compat/navigation" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

# next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		swcPlugins: [["next-superjson-plugin", {}]],
	},
	images: {
		domains: [
			"res.cloudinary.com",
			"avatars.githubusercontent.com",
			"lh3.googleusercontent.com",
		],
	},
};

module.exports = nextConfig;

```

# package.json

```json
{
  "name": "messenger-clone",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@headlessui/react": "^1.7.16",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^6.5.0",
    "@tailwindcss/forms": "^0.5.3",
    "@types/node": "20.3.2",
    "@types/react": "18.2.14",
    "@types/react-dom": "18.2.6",
    "autoprefixer": "10.4.14",
    "axios": "^1.4.0",
    "bcrypt": "^5.1.0",
    "clsx": "^1.2.1",
    "date-fns": "^2.30.0",
    "eslint": "8.43.0",
    "eslint-config-next": "13.4.12",
    "lodash": "^4.17.21",
    "next": "^13.5.9",
    "next-auth": "^4.22.3",
    "next-cloudinary": "^4.16.3",
    "next-superjson-plugin": "^0.5.9",
    "postcss": "8.4.24",
    "pusher": "^5.1.3",
    "pusher-js": "^8.3.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "^7.45.1",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.10.1",
    "react-select": "^5.7.4",
    "react-spinners": "^0.13.8",
    "tailwindcss": "3.3.2",
    "typescript": "5.1.6",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/lodash": "^4.14.196",
    "prisma": "^6.5.0"
  }
}

```

# pages/api/pusher/auth.ts

```ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/app/libs/pusher";

export default async function handler(
	request: NextApiRequest,
	response: NextApiResponse
) {
	// @ts-ignore
	const session = await getServerSession(request, response, authOptions);

	if (!session?.user?.email) {
		return response.status(401);
	}

	const socketId = request.body.socket_id;
	const channel = request.body.channel_name;
	const data = {
		user_id: session.user.email,
	};

	const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
	return response.send(authResponse);
}

```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String?
  email     String?   @unique
  emailVerified DateTime?
  image     String?
  hashedPassword String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  conversationIds String[] @db.ObjectId
  conversations Conversation[] @relation(fields: [conversationIds], references: [id])

  seenMessageIds String[] @db.ObjectId
  seenMessages Message[] @relation("Seen", fields: [seenMessageIds], references: [id])

  accounts Account[]
  messages Message[]
}

model Account {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  type     String
  provider  String
  providerAccountId String
  refresh_token String? @db.String
  access_token String? @db.String
  expires_at Int?
  token_type String?
  scope String?
  id_token String?
  session_state String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Conversation {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    createdAt DateTime @default(now())
    lastMessageAt DateTime @default(now())
    name     String?
    isGroup Boolean?

    messagesIds String[] @db.ObjectId
    messages Message[]

    userIds String[] @db.ObjectId
    users User[] @relation(fields: [userIds], references: [id])
}

model Message {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    body     String?
    image    String?
    createdAt DateTime @default(now())

    seenIds String[] @db.ObjectId
    seen User[] @relation("Seen", fields: [seenIds], references: [id])

    conversationId String @db.ObjectId
    conversation Conversation @relation(fields: [conversationId], references: [id])

    senderId String @db.ObjectId
    sender User @relation(fields: [senderId], references: [id], onDelete: Cascade)
}





```

# public/images/logo.png

This is a binary file of the type: Image

# public/images/placeholder.jpg

This is a binary file of the type: Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# README.md

```md
<h1 align="center">Messenger Clone</h1>

<div align="center">
  <img src="https://github.com/ayusshrathore/messenger-clone/raw/main/public/images/logo.png" height="50" width="50" />
</div>

## Introduction

Welcome to Messenger Clone! This is a full-stack web application built using Next.js, Prisma, Tailwind CSS, MongoDB, Pusher, and TypeScript. The project aims to provide a real-time messaging experience similar to popular messaging platforms. It enables users to send and receive messages in real-time, view their conversation history, and interact with other users seamlessly.

The Messenger Clone is designed to be a robust, scalable, and user-friendly platform for messaging and collaboration. Whether you want to build a private messaging app, a team collaboration tool, or simply explore the power of real-time communication, this project serves as a great starting point.

## Features

The Messenger Clone comes packed with a range of features to make messaging a delightful experience:

- **Real-Time Messaging**: Enjoy instant updates with real-time messaging powered by Pusher. When you send a message, it is delivered and displayed to the recipient without the need for page refresh.

- **User Authentication**: Ensure secure messaging by enabling user authentication and authorization. Only authenticated users can access the messaging platform.

- **Conversations**: Engage in one-on-one or group conversations with multiple participants. Conversations are threaded and easily navigable.

- **Message Status**: Know the status of your messages with delivery indicators. Check if your message is sent, delivered, or read by the recipient.

- **Conversation History**: Access and manage your conversation history easily. View past messages and revisit older conversations whenever needed.

- **Responsive Interface**: Enjoy a seamless messaging experience on any device. The platform is fully responsive, making it accessible from desktops, tablets, and smartphones.

## Screenshots

<img width="1470" alt="Screenshot 2023-08-03 at 7 36 24 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/cf386522-1861-40d2-944c-c3f4860c7394">
<img width="1470" alt="Screenshot 2023-08-03 at 7 37 42 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/0d20208e-9f51-4e10-9e07-2349d00d5e2c">
<img width="1470" alt="Screenshot 2023-08-03 at 7 38 24 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/978863ef-8e4b-49f5-b45d-c16605af512e">
<img width="1470" alt="Screenshot 2023-08-03 at 7 38 34 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/9dbdae16-f85e-4164-81df-0f8870564b55">
<img width="1470" alt="Screenshot 2023-08-03 at 7 39 35 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/66f2735b-eb0b-4378-b1ea-874cfedcebd0">
<img width="1470" alt="Screenshot 2023-08-03 at 7 39 49 PM" src="https://github.com/ayusshrathore/messenger-clone/assets/61450246/7fb35e72-8194-440f-958c-6540f991dd2b">


## Installation

Follow these simple steps to set up the project on your local machine:

1. Clone the repository: `git clone https://github.com/ayusshrathore/messenger-clone.git`
2. Navigate to the project directory: `cd messenger-clone`
3. Install dependencies: `npm install`

## Usage

Getting started with Messenger Clone is easy! Just follow these steps:

1. Configure environment variables:

   Create a `.env.local` file in the root directory and add the following variables:

   \`\`\`
    DATABASE_URL=your_database_url
    NEXTAUTH_SECRET=your_nextauth_secret
    
    GITHUB_ID=your_github_id
    GITHUB_SECRET=your_github_secret
    
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    PUSHER_APP_ID=your_pusher_app_id
    PUSHER_APP_KEY=your_pusher_app_key
    PUSHER_SECRET=yout_pusher_secret
    PUSHER_CLUSTER=yout_pusher_cluster
   \`\`\`

2. Start the development server: `npm run dev`
3. Open your browser and visit `http://localhost:3000` to access the Messenger Clone.

## Technologies

The project leverages a powerful stack of technologies to deliver a high-quality messaging experience:

- **Next.js**: A React framework for server-side rendering and building modern web applications. Next.js provides excellent performance and SEO optimization out of the box.

- **Prisma**: A sophisticated ORM (Object-Relational Mapping) tool for database interactions. Prisma simplifies database management and offers a type-safe query builder.

- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs. Tailwind CSS enables quick and efficient styling, resulting in a visually stunning UI.

- **MongoDB**: A popular NoSQL database for storing and retrieving message data. MongoDB's flexible document-based approach facilitates easy data management.

- **Pusher**: A real-time messaging service for instant message updates. Pusher powers real-time events and notifications, making messaging feel instantaneous.

- **TypeScript**: A typed superset of JavaScript, providing enhanced code quality and better developer experience. TypeScript brings static type checking and code predictability to the project.

```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

