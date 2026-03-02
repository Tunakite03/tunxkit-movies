# PostgreSQL with Docker Setup

This guide explains how to set up and run PostgreSQL using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

## Step 1: Start PostgreSQL Container

Run the Docker Compose file from the project root:

```bash
docker-compose up -d
```

This command will:

- Start a PostgreSQL 17 Alpine container
- Listen on ports `5432`
- Create database: `tunxkit_movies`
- Username: `postgres`
- Password: `postgres`

### Verify PostgreSQL is Running

```bash
docker-compose ps
```

You should see a healthy container status.

## Step 2: Set Up Environment Variables

In the `server/` directory, make sure you have a `.env` file with:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tunxkit_movies"
```

(Copy from `.env.example` if it doesn't exist)

## Step 3: Install Dependencies

```bash
cd server
pnpm install
```

## Step 4: Run Prisma Migrations

Generate Prisma client and run migrations:

```bash
cd server
pnpm db:generate
pnpm db:migrate
```

This will:

- Create all database tables
- Set up relationships and indexes

## Step 5: Start the Server

```bash
pnpm dev
```

The server should now be running on `http://localhost:4000` and connected to PostgreSQL.

## Step 6: View Database (Optional)

Open Prisma Studio to view/manage data:

```bash
pnpm db:studio
```

## Stopping PostgreSQL

To stop the container:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Troubleshooting

### Connection Refused Error

- Make sure Docker is running: `docker ps`
- Check container is healthy: `docker-compose ps`
- Wait a few seconds for PostgreSQL to fully start

### Port Already in Use

If port 5432 is already in use, edit `docker-compose.yml`:

```yaml
ports:
   - '5433:5432' # Change first port to 5433
```

Then update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/tunxkit_movies"
```

### Reset Database

To completely reset the database:

```bash
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

## Accessing PostgreSQL Directly

```bash
docker exec -it tunxkit-movies-postgres psql -U postgres -d tunxkit_movies
```

Then you can run raw SQL queries.

## Environment Variables (Customization)

Edit `docker-compose.yml` to change credentials:

```yaml
environment:
   POSTGRES_USER: myuser
   POSTGRES_PASSWORD: mypassword
   POSTGRES_DB: mydb
```

Update `DATABASE_URL` in `.env` accordingly.
