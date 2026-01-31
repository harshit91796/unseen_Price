# Use Nginx to serve the static files
FROM nginx:alpine

# Copy your local 'dist' folder to the container
COPY dist /usr/share/nginx/html

# Expose Port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]