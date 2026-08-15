create extension if not exists pgcrypto;

create table
    "auth_user" (
        "id" uuid not null default gen_random_uuid () primary key,
        "name" text not null,
        "email" text not null unique,
        "emailVerified" boolean not null,
        "image" text,
        "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
        "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
    );

create table
    "session" (
        "id" uuid not null default gen_random_uuid () primary key,
        "expiresAt" timestamptz not null,
        "token" text not null unique,
        "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
        "updatedAt" timestamptz not null,
        "ipAddress" text,
        "userAgent" text,
        "userId" uuid not null references "auth_user" ("id") on delete cascade
    );

create table
    "account" (
        "id" uuid not null default gen_random_uuid () primary key,
        "accountId" text not null,
        "providerId" text not null,
        "userId" uuid not null references "auth_user" ("id") on delete cascade,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamptz,
        "refreshTokenExpiresAt" timestamptz,
        "scope" text,
        "password" text,
        "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
        "updatedAt" timestamptz not null
    );

create table
    "verification" (
        "id" uuid not null default gen_random_uuid () primary key,
        "identifier" text not null,
        "value" text not null,
        "expiresAt" timestamptz not null,
        "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
        "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
    );

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");