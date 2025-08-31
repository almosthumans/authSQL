# Auth

## Statefull auth
- token stored in server(db, server)
- pros
    - high security
    - acces control
    - remove token to invalidate session
- cons
    - hard to scale
    - load balancing issue
    - memory usage
- small to mid apps
- banking webapps
- - session invalidation on server side



## Stateless auth
- token not stored in server
- token is shared to user
- pros
    - fast
    - scalable
- cons
    - can't force logout
    - risk , low security


## Single Sign-On (SSO)
- one login gives access to multiple apps
- 2 standards for auth
    - openid connect (OIDC)
    - SAML
- openid connect (SSO)
- google public key and private key
- /.well-known/openid-configuration  --> to integrate w/ standard auth of google, github
- access token:
    - Short-lived token (minutes to hours)
    - Sent with each request to prove user is authenticated
    - Used to access APIs/resources
- refresh token:
    - Long-lived token (days to weeks)
    - Not sent with every request
    - Used only to get a new access token when the old one expires

## Types of tokens
- JWT
    - encrypts data w/ payload 
    - secret key
    - very secure
    - encrypt - 2 way process (encryption - decryption)
- bcryptjs
    - hashes data
    - very secure
    - can't get original again
    - hashing - 1 way process
- crypto
    - generate random bytes
    - not so secure


# Prisma

## Prisma Setup and configuration

```bash
npx prisma init --datasource-provider postgresql
```

This will create a new folder called "prisma" in the root directory of your project. Inside this folder, you will find the following files:

- `schema.prisma`: This file contains the database schema definition.

## env file

In the root directory of your project, create a file called `.env` and add the following environment variables:

```bash
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
```

## Prisma Client

In your code, you can use the Prisma Client to interact with your database. The Prisma Client is a TypeScript library that allows you to write queries and mutations directly in your JavaScript code.

- create your generator block in prisma file
- create your model in generator file

## Prisma Migrations

Prisma migrations allow you to manage the database schema over time. You can use migrations to add or remove fields, tables, or relationships in your database.

```bash
npx prisma migrate dev
```

This command will generate a new migration file and apply it to the database.

## Prisma deploy

```bash
npx prisma migrate deploy
```

This command will apply all pending migrations to the database.

## Formating

```bash
npx prisma format
```

This command will format your Prisma schema file.
