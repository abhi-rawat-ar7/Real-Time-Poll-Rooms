# Real-Time Poll Rooms

A full-stack application built with Next.js, Supabase, and Tailwind CSS.

## 🛠 Features
- **Real-time Results:** Uses Supabase Realtime (PostgreSQL Changes) to update vote counts instantly for all users.
- **Persistence:** All polls and votes are stored in a PostgreSQL database.
- **Dynamic Links:** Each poll gets a unique UUID-based URL for sharing.

## 🛡 Fairness & Anti-Abuse Mechanisms
To ensure a fair voting process, I implemented the following:

1. **LocalStorage Fingerprinting:** - **What it prevents:** Prevents a single user from voting multiple times by marking their browser with a "voted" flag for that specific poll ID.
   - **Known Limitation:** Can be bypassed by clearing browser cache or using "Incognito/Private" mode.

2. **UI State Locking (Throttling):**
   - **What it prevents:** Prevents "Double-click" abuse or rapid-fire clicking which could send multiple network requests before the first one is processed. The voting button is disabled the instant the first click is detected.
   - **Known Limitation:** Does not prevent advanced users from sending direct HTTP requests to the database API via scripts.

## 🧩 Edge Cases Handled
- **Empty Options:** The poll creation logic filters out empty text inputs so only valid options are saved.
- **Visual Feedback:** Added a dynamic progress bar behind each option to visualize results even if vote counts are high.
- **Database Race Conditions:** Used a database function (`increment_vote`) to ensure vote counts increment correctly even if two people vote at the exact same millisecond.

## 🚀 Next Steps / Improvements
- **IP Address Tracking:** Store hashes of IP addresses in a separate table to provide stronger protection against Incognito-mode abuse.
- **User Accounts:** Optional login to track poll history for creators.

# Live demo link :-
https://real-time-poll-rooms-phi.vercel.app
