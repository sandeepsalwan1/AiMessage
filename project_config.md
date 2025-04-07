# Project Configuration (LTM)

*This file contains the stable, long-term context for the project.*
*It should be updated infrequently, primarily when core goals, tech, or patterns change.*
*The AI reads this at the start of major tasks or phases.*

---

## Core Goal

Add an NLP sentiment analysis feature to the messaging website. The feature should analyze conversations within the text messages section and display an indicator of:
1.  The overall sentiment (e.g., positive, negative, neutral) of the other user's messages.
2.  The inferred emotional state (e.g., happy, angry, sad) conveyed by the other user's messages.

---

## Tech Stack

*(**ACTION NEEDED:** Please fill in the specific technologies for your project)*
* **Frontend:** [e.g., React, Vue, Svelte, Next.js, TypeScript? CSS framework?]
* **Backend:** [e.g., Node.js, Express, Python/Flask/Django? Language?]
* **Database:** [Specify type if relevant, e.g., PostgreSQL, MongoDB - Note constraint below regarding Prisma]
* **NLP Library/Service:** [e.g., Compromise.js, Sentiment (npm), spaCy, NLTK, external API like Google Cloud Natural Language?]
* **Testing:** [e.g., Jest, Vitest, Cypress, Playwright?]
* **Linting/Formatting:** [e.g., ESLint, Prettier?]
* **Package Manager:** [e.g., npm, yarn, pnpm?]
* **Key Libraries:** [Any other relevant libraries?]

---

## Critical Patterns & Conventions

* **Scope:** Implement the sentiment analysis *only* within the text messaging display section/component.
* **Performance:** Ensure the analysis process is efficient and does not noticeably slow down the user interface or message loading. Run analysis asynchronously if needed.
* **Smooth Integration:** The sentiment indicators should be displayed clearly but unobtrusively alongside the relevant messages or conversation summary.

---

## Key Constraints

* **Branch:** Operate only on the current active branch. Do not merge or reference the `rohinp` branch unless specifically instructed.
* **Database Interaction:** **CRITICAL:** Do NOT change the Prisma database schema. Do NOT directly interact with the database (querying, resetting, modifying) for this feature unless absolutely necessary and planned explicitly. Focus on frontend or backend logic using existing data structures.
* **Minimal Changes:** Only modify the code strictly necessary to implement the sentiment analysis feature as described in the Core Goal. Avoid unrelated refactoring or changes.
* **Dependencies:** Get explicit approval before adding new major external dependencies, especially NLP libraries.