FROM php:8.5-apache AS final

# Install system dependencies
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
# Install and enable PHP extensions
RUN docker-php-ext-install pdo_sqlite
# Use the default production configuration for PHP runtime arguments, see
# https://github.com/docker-library/docs/tree/master/php#configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Enable URL redirects and `.htaccess` rules in Apache2
RUN a2enmod rewrite
# Make sure `AllowOverride All` option is set in the Apache2 configuration
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Create folder on localhost for docker to mount on run
RUN mkdir -p /var/www/html/htmlnotes

# Switch to a non-privileged user (defined in the base image) that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
USER www-data

# Start Apache server
CMD ["apache2-foreground"]
