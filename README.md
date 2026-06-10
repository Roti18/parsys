# Parsys

Parsys is a minimalist sales and inventory management system designed for perfume businesses. It features secure user authentication, stock tracking, transaction recording, and profit reporting.

## Tech Stack

- Frontend & Backend: SvelteKit
- Styling: Tailwind CSS
- Database: Turso (LibSQL)
- ORM: Drizzle ORM
- Package Manager: Bun

## Prerequisites

- Node.js (v18 or newer)
- Bun

## Installation and Setup

1. Clone the repository and install dependencies:

   ```bash
   bun install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Turso database credentials.

   ```bash
   cp .env.example .env
   ```

   Required variables in `.env`:
   ```
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```

3. Push the database schema to Turso:

   ```bash
   bunx drizzle-kit push
   ```

4. Start the development server:

   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:5173`.

## Production Build

To create a production-ready application:

```bash
bun run build
```

To preview the built application:

```bash
bun run preview
```

## License

This project is open-source and available under the MIT License.
