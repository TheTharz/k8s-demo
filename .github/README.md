# GitHub Actions Setup

This repository uses GitHub Actions to automatically build and push Docker images to DockerHub when code is pushed to the main branch.

## Required GitHub Secrets

To use the CI/CD pipeline, you need to set up the following secrets in your GitHub repository:

### How to add secrets:

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Required Secrets:

#### `DOCKERHUB_USERNAME`

- **Value**: Your DockerHub username
- **Example**: `yourusername`

#### `DOCKERHUB_TOKEN`

- **Value**: Your DockerHub access token (not your password)
- **How to get it**:
  1. Log into DockerHub
  2. Go to Account Settings → Security
  3. Click "New Access Token"
  4. Give it a name (e.g., "GitHub Actions")
  5. Copy the generated token

## What the pipeline does:

1. **Triggers**: Runs on push to `main` or `develop` branches, and on pull requests to `main`
2. **Builds**: Creates Docker images for both backend and frontend
3. **Tags**: Creates multiple tags:
   - `latest` (only for main branch)
   - `main-<short-sha>` or `develop-<short-sha>`
   - Branch name for feature branches
4. **Pushes**: Uploads images to DockerHub with names:
   - `<username>/k8s-demo-backend`
   - `<username>/k8s-demo-frontend`
5. **Updates**: Automatically updates Kubernetes deployment files with new image tags (main branch only)

## Image Names:

- Backend: `k8s-demo-backend`
- Frontend: `k8s-demo-frontend`

## Multi-platform Support:

Images are built for both `linux/amd64` and `linux/arm64` architectures.
