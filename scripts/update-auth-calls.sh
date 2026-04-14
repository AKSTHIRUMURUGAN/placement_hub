#!/bin/bash

# Script to update all requireAuth() and requireAdmin() calls to include request parameter

# Update requireAuth() calls
find app/api -name "*.ts" -type f -exec sed -i 's/requireAuth()/requireAuth(request)/g' {} +

# Update requireAdmin() calls  
find app/api -name "*.ts" -type f -exec sed -i 's/requireAdmin()/requireAdmin(request)/g' {} +

echo "Updated all authentication calls to include request parameter"
