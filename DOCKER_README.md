# Docker Setup for Imaginary Storage

This document provides comprehensive instructions for running the Imaginary Storage application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

1. **Clone the repository and navigate to the project root:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file for the backend
   cp apps/nest-backend/.env.example apps/nest-backend/.env
   
   # Edit the .env file with your configuration
   nano apps/nest-backend/.env
   ```

3. **Build and run the application:**
   ```bash
   # Build and start all services
   docker-compose up --build -d
   
   # Or run in foreground to see logs
   docker-compose up --build
   ```

4. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **MongoDB:** localhost:27017
   - **Redis:** localhost:6379

## Individual Docker Commands

### Frontend (React/Vite)

```bash
# Build the frontend image
docker build -t imaginary-storage-frontend ./apps/frontend

# Run the frontend container
docker run -p 3000:80 imaginary-storage-frontend
```

### Backend (NestJS)

```bash
# Build the backend image
docker build -t imaginary-storage-backend ./apps/nest-backend

# Run the backend container
docker run -p 8000:3000 --env-file ./apps/nest-backend/.env imaginary-storage-backend
```

## Docker Compose Commands

### Development

```bash
# Start all services
docker-compose up

# Start services in background
docker-compose up -d

# Rebuild and start services
docker-compose up --build

# Start specific service
docker-compose up frontend
```

### Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete database data)
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f

# Scale a service
docker-compose up --scale backend=3
```

### Maintenance

```bash
# Remove unused Docker objects
docker system prune

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# View running containers
docker-compose ps

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Environment Configuration

### Backend Environment Variables

Create `apps/nest-backend/.env` with the following variables:

```env
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/imaginarystorage?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AWS S3 (if using S3 storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name

# Email (for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
PORT=3000
NODE_ENV=production
```

## Production Deployment

### Using Docker Compose

1. **Create production environment file:**
   ```bash
   cp apps/nest-backend/.env.example apps/nest-backend/.env.production
   # Edit with production values
   ```

2. **Use production compose file:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml imaginary-storage

# List services
docker service ls

# Scale services
docker service scale imaginary-storage_backend=3
```

## Health Checks

The Docker setup includes health checks for all services:

- **Frontend:** HTTP check on port 80
- **Backend:** HTTP check on `/health` endpoint
- **MongoDB:** MongoDB ping command
- **Redis:** Redis ping command

Check service health:
```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues:**
   ```bash
   # Check MongoDB container logs
   docker-compose logs mongodb
   
   # Verify MongoDB is accessible
   docker-compose exec mongodb mongosh
   ```

4. **Build failures:**
   ```bash
   # Clean Docker cache
   docker builder prune
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Debugging

```bash
# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View container resource usage
docker stats

# Inspect container configuration
docker-compose config
```

## Security Considerations

1. **Environment Variables:** Never commit `.env` files with sensitive data
2. **Database Security:** Change default MongoDB credentials
3. **Network Security:** Use custom networks for production
4. **Image Security:** Regularly update base images
5. **Secrets Management:** Use Docker secrets in production

## Performance Optimization

1. **Multi-stage builds:** Already implemented for smaller image sizes
2. **Build cache:** Use BuildKit for faster builds
3. **Resource limits:** Set memory and CPU limits in production
4. **Health checks:** Monitor service health
5. **Logging:** Configure proper log rotation

## Monitoring

Add monitoring services to your setup:

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Backup and Recovery

```bash
# Backup MongoDB data
docker-compose exec mongodb mongodump --archive=/data/backup.archive

# Restore MongoDB data
docker-compose exec mongodb mongorestore --archive=/data/backup.archive
```