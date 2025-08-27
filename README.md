# Auth
- statefull auth
- sticky sessions
- vertical and horz scaling
- banks use, statefull auth (sessions)
- not scalable but security

- stateless auth: data to user, jwt encrypt
- scalable >> secure
- user can read but should not write
- asymetric encyption -> stamp 
- jwks

- 2 standards for auth
    - openid connect
    - SAML
- openid connect (SSO)
- google public key and private key
- /.well-known/openid-configuration  --> to integrate w/ standard auth of google, github
- SSO
- diffn betn Oauth2 and openid connect
- access token: 1m
- refresh token: 24h


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
