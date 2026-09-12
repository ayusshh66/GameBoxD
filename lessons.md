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