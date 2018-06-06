RESOURCES
=======  
- [Dokku docs](http://dokku.viewdocs.io/dokku/)
- [Dokku application management commands](http://dokku.viewdocs.io/dokku/deployment/application-management/#application-management)
- [Dokku process management commands](https://github.com/dokku/dokku/blob/master/docs/deployment/process-management.md)
- [Dokku Postgres DB commands](https://github.com/dokku/dokku-postgres)
- [Other Dokku plugins](http://dokku.viewdocs.io/dokku/community/plugins/#official-plugins-beta)

SETUP
=======
## create ssh key (client)
 - create ssh key
 - add host ip to associated ssh key
 - login name "root"

## connecting to server (client)
 `$ ssh root@<IP address>`  

## setup dokku (server)
 `$ wget https://raw.githubusercontent.com/dokku/dokku/v0.10.5/bootstrap.sh`  
 `$ sudo DOKKU_TAG=v0.10.5 bash bootstrap.sh`  
 - goto `http://<IP address>`
 - fill out required fields
 - replace IP address with your website name on the dokku landing page
 - follow on-screen instructions

## setup postgres (server)
 `$ dokku plugin:install https://github.com/dokku/dokku-postgres.git`  
 `$ dokku postgres:create my-database`  
 `$ dokku postgres:expose my-database 5432`  
 `$ dokku postgres:info my-database`  
 - db is now available to connect. Take connection details from DSN url.
 - DSN: `[database type]://[username]:[password]@[host]:[port]/[database name]`
 - When accessing from client, set [host] to the IP address of the server

## setup DB tables (client)
 `$ cd database`  
 `$ npm install`  
 `$ DSN=<DSN> node models.js`  
 - replace <DSN> with the DSN you got from the previous step making sure [host] is the IP of the server.
 - check the server database to verify the tables were created

## create server (server)
 `$ dokku apps:create my-server`  

## link server to database (server)
 `$ dokku postgres:link my-database my-server`  
 - db credentials (DSN link) is available to the server through the environment variable DATABASE_URL that dokku provides

## deploy server code (client)
 - zip the node folder  
 `$ tar -C ./node -czvf node.tar.gz .`  
 - push the code to the server  
 `$ cat node.tar.gz | ssh root@<IP address> "dokku tar:in my-server"`  
 
## setup domain (server)
 `$ dokku domains:add my-server <website>.com`  
 - point domain DNS "A" record to website IP address

## proxy port change for http domain (server)
 - you can view the current proxy ports by running  
 `$ dokku proxy:ports my-server`  
 - change proxy port from ip address to http address  
 `$ dokku proxy:ports-add my-server http:80:3000`  
 `$ dokku proxy:ports-remove my-server 3000`  

## SSL setup with letsencrypt (server)
 `$ dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git`  
 `$ dokku config:set --no-restart my-server DOKKU_LETSENCRYPT_EMAIL=<EMAIL>`  
 `$ dokku letsencrypt my-server`  
 `$ dokku proxy:ports-add my-server https:443:3000`  
 `$ dokku letsencrypt:cron-job --add`  
 - with your DNS provider, use a regular (@) for "A" record on domain
 - letsencrypt can't use a wildcard (*) for "A" record on domain


Other
=======
## updating ubuntu and dokku (server)
 - to update ubuntu and dokku, run  
 `$ dokku-update`  
 - if system restart is required run  
 `$ shutdown -r now`  
 - dokku will automaticly spin back up when the system is restarted

## docker cleanup unused containers (server)
 `$ docker system prune --volumes`  

## debug, hanging containers still running (server)
 - this happens if you shutdown/restart the server immediately after a code push 
 - old dokku docker containers take a few minutes to destroy after new containers are active  
 `$ docker ps`  
 - should contain 2 containers for postgres and the number of instances listed in `node/DOKKU_SCALE`
 - remove excess hanging docker containers  
 `$ docker stop <container_id>`  
 `$ docker rm <container_id>`  

## view open ports (server)
 `$ netstat -ntlp | grep LISTEN`  

## uninstall and remove dokku (server)
 `$ apt-get purge -yf dokku nginx nginx-common docker-engine herokuish`  
 `$ apt autoremove -yf`  
 `$ rm -rf /var/lib/dokku/ /home/dokku/ /usr/bin/dokku /var/www/html/`  
 - [see the uninstall docs](http://dokku.viewdocs.io/dokku/getting-started/uninstalling/#uninstalling)








