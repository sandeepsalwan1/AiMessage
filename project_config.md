# Project Configuration (LTM)

*This file contains the stable, long-term context for the project.*
*It should be updated infrequently, primarily when core goals, tech, or patterns change.*
*The AI reads this at the start of major tasks or phases.*

---

## Core Goal

Add an NLP sentiment analysis feature to the messaging website. The feature should analyze conversations within the text messages section and display an indicator of:
1.  The overall sentiment (e.g., positive, negative, neutral) of the other user's messages.
2.  The inferred emotional state (e.g., happy, angry, sad) conveyed by the other user's messages.

**Implementation Status:** ✅ COMPLETED

**Implementation Details:**
* The sentiment analysis feature has been successfully implemented as a component that appears at the top of conversation threads.
* The implementation analyzes all messages in a conversation to determine overall sentiment.
* Users can toggle the sentiment analysis display on/off using a button in the conversation header.
* The feature includes proper error handling, loading states, and performance optimizations.

---

## Tech Stack

* **Frontend:** Next.js 13.x with React 18.x, TypeScript, Tailwind CSS
* **Backend:** Next.js API routes
* **Database:** MySQL with Prisma ORM
* **NLP Library:** sentiment npm package (already installed)
* **Testing:** N/A for this feature
* **Linting/Formatting:** ESLint, Next.js default configuration
* **Package Manager:** npm
* **Key Libraries:** 
  * next-auth for authentication
  * pusher/pusher-js for real-time messaging
  * axios for API requests
  * react-icons for UI icons
  * clsx for conditional class names
  * date-fns for date formatting

---

## Critical Patterns & Conventions

* **Scope:** Implement the sentiment analysis *only* within the text messaging display section/component.
* **Performance:** Ensure the analysis process is efficient and does not noticeably slow down the user interface or message loading. Run analysis asynchronously if needed.
* **Smooth Integration:** The sentiment indicators should be displayed clearly but unobtrusively alongside the relevant messages or conversation summary.

**Implementation Notes:**
* The sentiment analysis is performed client-side using the existing sentiment npm package.
* A debounce mechanism (500ms) was implemented to ensure performance with large message sets.
* Special handling was added for conversations with fewer than 3 messages to avoid misleading analysis.
* Fallback UI components were created for loading states and error conditions.
* The toggle button allows users to hide the sentiment analysis if they prefer not to see it.

---

## Key Constraints

* **Branch:** Operate only on the current active branch. Do not merge or reference the `rohinp` branch unless specifically instructed.
* **Database Interaction:** **CRITICAL:** Do NOT change the Prisma database schema. Do NOT directly interact with the database (querying, resetting, modifying) for this feature unless absolutely necessary and planned explicitly. Focus on frontend or backend logic using existing data structures.
* **Minimal Changes:** Only modify the code strictly necessary to implement the sentiment analysis feature as described in the Core Goal. Avoid unrelated refactoring or changes.
* **Dependencies:** Get explicit approval before adding new major external dependencies, especially NLP libraries.

**Constraint Compliance:**
* All constraints were successfully adhered to in the implementation.
* No database schema changes were made.
* Only modified the minimal necessary files (Body.tsx, Header.tsx, page.tsx).
* Used the existing sentiment npm package without adding new dependencies.