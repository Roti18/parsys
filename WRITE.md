Title:
Parsys

Short desc:
Minimalist sales and inventory management system for perfume businesses.

Markdown:

# Overview

Parsys is a sales and inventory management system designed specifically for perfume businesses. It provides a secure, streamlined interface for tracking product stock, recording sales transactions, calculating profit margins based on changing capital costs, and generating business reports.

([insertImage: The main dashboard showing sales trends and recent transactions])

# Features

### Product Management
Efficiently organize and track your entire inventory. You can manage items with detailed specifications including unique SKU (Stock Keeping Unit), product names, and volume specifications. This ensures that every variation of a perfume is accounted for systematically in the database.
([insertImage: The Product Management dashboard showing a list of perfume variants and their SKUs])

### Restock Tracking
Maintain a clear history of incoming inventory. Every time new stock arrives, you can record the exact restock batch along with its specific capital cost and quantity. This precise tracking allows the system to differentiate between items bought at different supplier prices over time.
([insertImage: The Restock Entry form or history table displaying batches, quantities, and capital costs])

### FIFO Sales Calculation
Experience highly accurate profit margins with First-In, First-Out (FIFO) logic. When a sale is logged, the system automatically deducts stock from the oldest available restock batches first. If a sale spans across multiple batches with different capital costs, the system calculates the exact proportional cost, ensuring perfect financial accuracy even when supplier prices fluctuate.
([insertImage: A diagram or visual representation in the UI showing how a sale is split across different restock batches with varying costs])

### Profit Reporting
Gain instant visibility into your business's financial health. The system generates accurate profit reports by calculating the exact difference between the selling price and the specific capital cost of each sold item (based on the FIFO calculation). This eliminates guesswork and provides true profit margins.
([insertImage: A chart or detailed report page showing revenue, capital cost, and net profit margins over time])

### Secure Authentication
Protect your business data with a robust security model. The system uses a custom session-based authentication flow to ensure that only the authorized business owner can access the dashboard. Public registration is intentionally disabled to maintain strict control over who can view or modify sensitive inventory and financial data.
([insertImage: The secure login screen for the Parsys system])

([insertImage: The sales transaction interface showing product selection and FIFO cost calculation])

# Technical Implementation

- **Requirements:** Node.js, Bun package manager, and a Turso account for the database.
- **Installation:**
```bash
bun install
```
- **Configuration:** Copy the `.env.example` file to configure the database credentials.
```bash
cp .env.example .env
```
- **Environment variables:**
```env
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your_turso_auth_token"
```
- **Configuration files:** `drizzle.config.ts` handles the schema generation, and `vite.config.ts` configures the SvelteKit application.
- **Database setup:** Push the SQLite schema to Turso:
```bash
bun run db:push
```
- **How to run the project:** Start the development server:
```bash
bun run dev
```
- **Important commands:**
  - `bun run build`: Creates a production ready build.
  - `bun run lint`: Checks formatting and linting rules.
  - `bun run db:studio`: Opens the local database viewer.
- **Main workflow:** Authenticated users manage product entries, add restock batches (which increase inventory), and record sales (which decrease inventory using FIFO cost logic).
- **Important usage notes:** The system requires an initial user account to be created directly in the database, as public registration is disabled for security.

# Development

- **SvelteKit:** The core framework handling routing, server-side data loading, and API actions.
- **Drizzle ORM & Turso:** Drizzle provides type-safe queries and schema definitions connecting to a Turso LibSQL edge database.
- **Tailwind CSS:** Used for all styling by providing utility classes directly within Svelte components.
- **Bun:** Used as the primary package manager and script runner.
- **Custom Authentication:** A custom session based authentication flow is implemented utilizing the SQLite database to track active user sessions.

# Highlights

- **FIFO Cost Calculation:** When a sale is made, the backend automatically associates the sale with specific restock batches. If a sale consumes 5 items but the oldest restock only has 2 left, it splits the calculation across multiple restock batches. This guarantees that profit reporting remains perfectly accurate even if the supplier price changes between restocks.
- **Edge Database Architecture:** Utilizing Turso provides a low latency database experience that fits perfectly with SvelteKit's serverless rendering model.
- **Transactional Integrity:** Complex operations like deleting a sale use database transactions to safely revert the deducted stock back to the correct original restock batches before removing the record.
