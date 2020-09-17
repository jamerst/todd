<p align="center">
  <img width="200" height="200" src="https://raw.githubusercontent.com/jamerst/todd/master/res/todd_plain.svg">
</p>

<h1 align="center">Todd</h1>
<h3 align="center">A custom inventory management system for Warwick Tech Crew</h3>

Todd is the inventory management system for Warwick Tech Crew and the Drama Collective at the University of Warwick. It allows drama societies to easily search and view the items available for productions, without having to search for items physically. It features a read-only mode, which allows viewing of items using a shared password, and a regular account-based system for users who can create and modify items.

## About
Todd is a web-application written using the ASP.NET Core back-end framework with a React.js front-end, utilising TypeScript and material-ui. It is named after the one, the only Todd Olive (Tech Crew Boom Officer, 2017-2020).

## Deployment
Todd is a dockerised application, so deployment is relatively easy. For the development build, simply run `docker-compose up` in the `todd` directory. The development build supports automatic re-compiling and remote debugging using vsdbg, but is unoptimised and insecure, so not suitable for production.

Production builds require a valid certificate for HTTPS. The default path is `/certs/todd-https.pfx`. Generating this certificate is relatively simple using Let's Encrypt and openssl. Certificates should be password-protected, modify `docker-compose-prod.yml` to add the password for the HTTPS certificate. Secret keys for JWTs should also be created and added to `docker-compose-prod.yml`, these should be long pseudorandom strings of characters.

The database is pre-seeded with an admin account (U: admin, P: password), and the read-only password is set to "changeme" by default. These should of course be changed as soon as possible.

Start the production build by running `docker-compose -f docker-compose-prod.yml up` in the `todd` directory.

Tested under Linux, should work under other environments, but this hasn't been tested.
