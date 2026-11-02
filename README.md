## WHAT IT DOES
HTML based note taking application run on localhost. Save all notes in HTML format files on localhost http://localhost/htmlnotes/notes/. And also in SQLite database `notes.sqlite`.
No more fear of note format not transferable. HTML format enables more formatting than markdown.

### PERSONAL USE
I made this after I could no longer make Tomboy notes work any longer on Windows 11. A Tomboy notes replacement. Yes, Tomboy notes can be imported, as long as they are exported to HTML in Tomboy first.

I personally use this note taking application for work/programming notes. I use Firefox's pin to taskbar feature to make the localhost website act like a local windows application (See screenshot).

<img width="1093" height="1185" alt="htmlnotes" src="https://github.com/user-attachments/assets/dfa18009-9341-49de-8dc1-b405f9a133e8" />


## RUN WITH DOCKER (any platforms)
Install Docker core engine CLI. Example on Debian:

```
$ sudo apt-get install docker.io
$ sudo apt-get install docker-compose-2
```

Clone the repository. Then build and start up docker:

```
$ cd htmlnotes/
$ docker compose build
$ docker compose up -d
```

Go to http://localhost:9000/htmlnotes/index.html. Notes are saved in `htmlnotes/notes/` diretory.


## MANUAL SET UP ON `LOCALHOST`

### PREREQUISITE
- Linux or WSL2 (Windows) platform.
- PHP 8.4 or higher `$ php -v`
- Apache2 `$ apache2 -v`
- Sqlite3 `$ sqlite3 -v`
- PHP sqlite3 `$ sudo apt-get install php-sqlite3`
- PHP DOM `$ sudo apt-get install php-dom` (if needed, DOM extension is enabled by default in PHP >=8.5)

### SET UP
Enable URL redirects and `.htaccess` rules in Apache2.
> $ a2enmod rewrite

> $ sudo systemctl restart apache2

Make sure `AllowOverride All` option is set in the Apache2 configuration.

> $ sudo nano /etc/apache2/apache2.conf

```
<Directory /var/www/>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
</Directory>
```

Clone the repository. Copy the whole thing `/htmlnotes` to `/var/www/html/` folder.

Open `index.html` in the browser: http://localhost/htmlnotes/index.html


## DEPENDENCIES
- https://github.com/steampixel/simplePHPRouter Simple PHP Router
- https://fontawesome.com/ Font Awesome
- https://github.com/basecamp/trix Trix rich text editor

## INSPIRED FROM
- https://github.com/HTMLToolkit/HTMLNotes Markdown based note taking app on single page. Notes are saved in browser's localstorage.

