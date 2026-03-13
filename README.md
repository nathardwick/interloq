# Interloq

AI-powered consultancy simulation platform for Higher Education.

## Quick Start

### Docker (recommended)

```bash
docker compose up --build -d
```

App runs at [http://localhost:3003](http://localhost:3003). MongoDB on port 27018.

### Local

```bash
npm install
npm run dev
```

Requires a MongoDB instance at `MONGODB_URI` (see `.env.local`).

## Seed Database

Create test users (student + tutor):

```bash
# Inside Docker
npm run seed:docker

# Local (requires MongoDB running)
npm run seed
```

Test credentials after seeding:
- **Student:** student@test.com / test1234
- **Tutor:** tutor@test.com / test1234
