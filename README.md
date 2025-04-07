# AiMessage - Real-Time Messaging Platform

## Overview

AiMessage is a full-stack messaging application that combines real-time communication with AI capabilities. Built with modern web technologies, it demonstrates expertise in database design, real-time data management, and scalable architecture.

## Screenshots

<div align="center">
  <img src="public/screenshots/login-view.png" alt="Login View" width="800"/>
  <p><em>Secure login interface with modern authentication</em></p>
  
  <img src="public/screenshots/conversation-view.png" alt="Conversation View" width="800"/>
  <p><em>Real-time conversation interface with message history</em></p>
  
  <img src="public/screenshots/profile-editor.png" alt="Profile Editor" width="800"/>
  <p><em>User profile management and customization</em></p>
  
  <img src="public/screenshots/image-in-convo.png" alt="Image Sharing" width="800"/>
  <p><em>Rich media support with image sharing capabilities</em></p>
  
  <img src="public/screenshots/delete-convo.png" alt="Conversation Management" width="800"/>
  <p><em>Conversation management with delete functionality</em></p>
</div>

## Key Features

- **Real-Time Messaging**: Instant message delivery powered by Pusher
- **User Management**: Secure authentication and profile management
- **Conversation Management**: Support for one-on-one and group conversations
- **Message History**: Efficient storage and retrieval of conversation history
- **AI Integration**: Built-in support for AI-powered features
- **Responsive Design**: Fully responsive interface for all devices

## Technical Implementation

### Database Design
- Designed and implemented a scalable MySQL database schema
- Optimized for real-time message delivery and status updates
- Implemented efficient query patterns for message threading and conversation history
- Created tables for Users, Conversations, Messages, Participants, and AI Interactions

### Complex Query Support
- Message threading and conversation history
- User activity tracking and analysis
- Message delivery status monitoring
- AI interaction pattern analysis
- User engagement metrics

## Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Real-time**: Pusher
- **Authentication**: NextAuth.js
- **State Management**: Zustand

## Project Highlights

- Designed and implemented a scalable database architecture
- Created efficient query patterns for real-time messaging
- Integrated AI capabilities with traditional messaging features
- Implemented secure user authentication and authorization
- Developed a responsive and intuitive user interface

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/sandeepsalwan1/AiMessage
cd AiMessage
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file with:
```env
DATABASE_URL=mysql://username:password@localhost:3306/aimessage
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

4. Start the development server:
```bash
npm run dev
```

## Skills Demonstrated

- Database Design and Optimization
- Real-time Data Management
- Complex SQL Query Writing
- Full-stack Web Development
- API Design and Implementation
- User Authentication and Security
- Responsive UI Development
- AI Integration
- Performance Optimization
