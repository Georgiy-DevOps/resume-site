#!/bin/bash
cd /opt/resume-site
git pull origin main
cp index.html /var/www/resume/index.html
cp -f photo.webp /var/www/resume/photo.webp 2>/dev/null
cp -f og-image.svg /var/www/resume/og-image.svg 2>/dev/null
echo "$(date): deployed" >> /var/log/resume-deploy.log
