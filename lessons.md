### Table Design Rules: Primary Key vs. Composite Unique

**1. Composite Primary Key** `primaryKey({ columns: [table.A, table.B] })`

* **What it is:** The combination of two foreign key columns acts as the main identifier. No `id` column is used.
* **When to use:** Pure **junction/linking tables** (e.g., `gameGenres`, `gamePlatforms`, `userWishlist`).
* **Why:**
* The record has no independent life—it only exists to connect two tables.
* No other table will ever create a foreign key pointing to a junction row.
* Prevents duplicate links automatically and saves database storage space.



---

**2. Surrogate ID + Composite Unique** `id: uuid()` + `unique().on(table.A, table.B)`

* **What it is:** The table has a standard single-column `id` (primary key), plus a rule enforcing that two specific columns can't repeat together.
* **When to use:** **Domain entities** or **data tables** that hold extra metadata or state (e.g., `gameSources`, `reviews`).
* **Why:**
* **Surrogate `id`:** Gives child tables a clean, single UUID to reference as a foreign key (e.g., `price_history` pointing to `source_id`).
* **Composite `unique()`:** Acts as a safety guard to stop duplicate records from being inserted by bug or duplicate API calls (e.g., stopping the same Steam store ID from being linked to a game twice).



---

### Key Takeaway for Notes

> * **Composite `primaryKey**` = Used for **relationships** (pure join tables with zero child tables).
> * **Surrogate `id` + Composite `unique()**` = Used for **entities** (tables that have their own data, endpoints, or child tables referencing them).
> 
<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ENDS HERE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->


#BROWSER COOKIES

A cookie (also known as a web cookie or browser cookie) is a small piece of data a server sends to a user's web browser. The browser may store cookies, create new cookies, modify existing ones, and send them back to the same server with later requests.

Cookies are mainly used for three purposes:-
Session management: User sign-in status, shopping cart contents, game scores, or any other user session-related details that the server needs to remember.
Personalization: User preferences such as display language and UI theme.
Tracking: Recording and analyzing user behavior.

### Global Error Handling (`next(error)`)
* Passing caught exceptions to `next(error)` delegates error processing to a centralized Express error-handling middleware (`app.use((err, req, res, next) => ...)`).
* Eliminates boilerplate HTTP status handling across individual controller methods, standardizing response signatures for validation (`ZodError`), authorization, and database failures.

Without next(error): Every controller has to check if error is a Zod error, a DB error, or an auth error, and manually set .status(400), .status(401), or .status(500).

With next(error): Your controller code stays completely clean—just next(error). The centralized middleware handles status code mapping and formatting in one single place for your entire API.

