Prereqs:
- Docker (and docker compose plugin)

Quick start:
1. Create a `.env` file in project root with a strong secret:
   JWT_SECRET=replace_with_a_strong_random_value

2. Build and start services:
```bash
docker compose up --build -d
```

3. View logs:
```bash
docker compose logs -f app
```

4. Open the app:
- http://localhost:3000
- API docs: http://localhost:3000/api-docs

Stop and remove:
```bash
docker compose down -v
```
