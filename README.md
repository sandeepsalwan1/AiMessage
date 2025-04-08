# AiMessage - Real-Time Messaging Platform

## Overview

AiMessage is a full-stack AI messaging application that combines real-time communication with mental health awareness features. Built with modern web technologies, it demonstrates expertise in database design, real-time data management, NLP, and scalable architecture. Used tools like sentiment, react, Next.js, Prisma (with MySQL (Aiven)), Tailwind CSS, Javascript, Pusher, Github+Google OAUTH, and TypeScript for the complete deployment of this application.


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
- **Mental Health Analysis**: Real-time sentiment analysis and emotional state detection
- **Responsive Design**: Fully responsive interface for all devices

## Technical Implementation

### Database Design
- Designed and implemented a scalable MySQL database schema
- Optimized for real-time message delivery and status updates
- Implemented efficient query patterns for message threading and conversation history
- Created tables for Users, Conversations, Messages, Participants, and Mental Health Insights

### Mental Health Analysis Features
- Real-time sentiment analysis of messages
- Emotional state detection (Positive, Negative, Neutral)
- Risk level assessment for mental health concerns
- Keyword detection for mental health-related terms
- Automated recommendations based on conversation sentiment
- Conversation-level sentiment tracking

## Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Real-time**: Pusher
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **AI/NLP**: Natural, Sentiment.js

## Project Highlights

- Designed and implemented a scalable database architecture
- Created efficient query patterns for real-time messaging
- Integrated mental health analysis features with traditional messaging
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
- Natural Language Processing
- Performance Optimization
