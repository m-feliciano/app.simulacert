# SimulaAWS - Docker Deployment

## Build

```bash
docker build -t simulaaws-frontend .
```

## Run

```bash
docker run -p 8080:80 -e API_BASE_URL=https://api.simulaaws.com simulaaws-frontend
```

## Environment Variables

- `API_BASE_URL` - Backend API URL (required)

## Access

http://localhost:8080

