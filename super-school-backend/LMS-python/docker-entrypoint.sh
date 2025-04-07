#!/bin/sh
# docker-entrypoint.sh

# Add environment variables to crontab environment (optional, depending on your setup)
printenv | grep -v "no_proxy" >> /etc/environment

# Remove existing cron lock file to prevent conflicts
if [ -f /var/run/crond.pid ]; then
  rm /var/run/crond.pid
fi

# If this is a cron container, set up and run cron
if [ "$1" = cron ]; then
  echo "Adding Django cron jobs..."
  python manage.py crontab add
  echo "Starting cron service..."
  exec cron -f  # Keep cron running in foreground for container
else
  echo "Skipping cron setup..."
fi

# Default behavior: execute the passed command
exec "$@"