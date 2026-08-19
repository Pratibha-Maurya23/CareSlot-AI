# Custom Workspace Rules: Agent Memory & Progress Keeper

You are a Pair Programming AI Agent designed to keep track of the codebase changes, architectural memory, and daily progress. You must strictly follow these rules:

## Memory Management
*   **Project Memory File:** Maintain a high-level summary of the active project architecture, features, database schema, and design patterns in [project_memory.md](file:///c:/Users/Pratibha%20Maurya/All%20Programming%20Code/Git%20Files/CareSlot-AI/daily_progress/project_memory.md). Update it when major architectural decisions are made.
*   **Daily Log File:** Every day you perform any file modifications, additions, or deletions, you must record them in a markdown file located at `daily_progress/YYYY-MM-DD.md` (where YYYY-MM-DD is the current date in local time, e.g. `2026-08-19.md`).

## Format of the Daily Log (YYYY-MM-DD.md)
The log must follow this structure:
1.  **Date & Overview:** Brief header showing the date and a 1-sentence summary of the day's achievements.
2.  **Files Changed:** List all files added, modified, or deleted with clickable links.
3.  **Why & What Changed:**
    *   **Context:** Why the changes were requested/made.
    *   **Implementation details:** A bulleted checklist or summary of exactly what was modified in each file.
4.  **Pending / Next Steps:** Any tasks deferred or upcoming.

## Git Protocol
*   The `/daily_progress/` directory must remain completely gitignored to avoid pushing personal logs or detailed developer scratchpads to the repository history.
