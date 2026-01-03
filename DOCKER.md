# simulacert - Docker Deployment

## Build

```bash
docker build -t simulacert-frontend .
```

## Run

```bash
docker run -p 8080:80 -e API_BASE_URL=https://api.simulacert.com simulacert-frontend
```

## Environment Variables

- `API_BASE_URL` - Backend API URL (required)

## Access

http://localhost:8080

