DROP DATABASE IF EXISTS fabricator_test;
CREATE DATABASE fabricator_test WITH OWNER = dev;
\c fabricator_test;

-- Create syntax for TABLE 'department'
CREATE TABLE "department" (
   id   SERIAL PRIMARY KEY,
   name                VARCHAR NOT NULL DEFAULT '',
   "organizationId"    INT     NOT NULL
);

-- Create syntax for TABLE 'organization'
CREATE TABLE "organization" (
   id   SERIAL PRIMARY KEY,
   name                VARCHAR    NOT NULL DEFAULT ''
);

-- Create syntax for TABLE 'user'
CREATE TABLE "user" (
   id         SERIAL PRIMARY KEY,
   "firstName"               VARCHAR    NOT NULL DEFAULT '',
   "lastName"                VARCHAR    NOT NULL DEFAULT '',
   username                  VARCHAR    NOT NULL DEFAULT '',
   "departmentId"            INT        NOT NULL
);
