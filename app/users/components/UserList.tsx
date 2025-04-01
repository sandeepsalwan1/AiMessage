"use client";

import { User } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import UserBox from "./UserBox";
import { pusherClient } from "@/app/libs/pusher";

interface UserListProps {
  users: User[];
}

const UserList: FC<UserListProps> = ({ users: initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  useEffect(() => {
    // Subscribe to the users channel
    pusherClient.subscribe("users-channel");

    // Handle new user event
    const newUserHandler = (newUser: User) => {
      setUsers((currentUsers) => {
        // Check if the user already exists in our list
        if (currentUsers.some((user) => user.id === newUser.id)) {
          return currentUsers;
        }

        // Add the new user to our list
        return [newUser, ...currentUsers];
      });
    };

    // Handle user update event
    const updateUserHandler = (updatedUser: User) => {
      setUsers((currentUsers) => 
        currentUsers.map((existingUser) => 
          existingUser.id === updatedUser.id ? updatedUser : existingUser
        )
      );
    };

    // Bind the event handlers
    pusherClient.bind("user:new", newUserHandler);
    pusherClient.bind("user:update", updateUserHandler);

    // Cleanup function
    return () => {
      pusherClient.unsubscribe("users-channel");
      pusherClient.unbind("user:new", newUserHandler);
      pusherClient.unbind("user:update", updateUserHandler);
    };
  }, []);

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
