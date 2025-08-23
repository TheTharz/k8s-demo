# Use nginx alpine as base image
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Set default environment variable
ENV API_BASE_URL=http://localhost:3001/api

# Copy static files to a temporary location
COPY . /tmp/frontend

# Create entrypoint script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst < /tmp/frontend/config.js > /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'cp -r /tmp/frontend/* /usr/share/nginx/html/' >> /docker-entrypoint.sh && \
    echo 'envsubst < /tmp/frontend/config.js > /usr/share/nginx/html/config.js' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
