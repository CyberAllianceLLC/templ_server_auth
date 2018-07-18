# OAuth Server Boilerplate Example

This is a template node server with OAuth authentication using Dokku.  
  
Client side code can be found here: [templ_vue_auth](https://github.com/CyberAllianceLLC/templ_vue_auth)
  
## Local Setup
* Duplicate and rename `node/example.config.js` to `node/config.js` with the appropriate credentials.
* Run the server on localhost  
`$ docker-compose build`  
`$ docker-compose up`  
* You can now access the server from `http://localhost:3000/`

## Production Setup
* Duplicate and rename `node/example.config.js` to `node/config.js` with the appropriate credentials.
* Minimise and copy your client side website into `node/public`
* Setup Dokku and deploy code (See [DOKKU_INSTRUCTIONS.md](DOKKU_INSTRUCTIONS.md))