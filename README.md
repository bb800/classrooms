# Setup Instructions

1. Database Setup

This application connects directly to a mariadb instance on localhost. The database configurations are maintained in `/server/db/configurations.js`.

2 databases are used:

- `classroom` for the actual application, and
- `test_classroom` for running tests

[Docker Desktop](https://www.docker.com/get-started) was used to quickly setup an instance of mariadb 10.4

```bash
# Docker command

$ docker run \
-itd \
--restart=on-failure:10 \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=root \
--name nodejs_mariadb \
mariadb:10.4
```

The setup in both databases are identical. An `init.sql` file has been included initalize to both databases with the correct tables. The application database `classroom` will be prepopulated with a small dataset as a result of executing the commands in `init.sql`.

To setup the database

```bash
# copy init.sql into mariadb container
$ docker cp init.sql nodejs_mariadb:/init.sql

# connect to running mariadb container
$ docker exec -it nodejs_mariadb bash

# execute init.sql as mysql root user
$ mysql -u root -proot < init.sql
```

&nbsp;  
&nbsp;  
&nbsp;

# Running the application

- `npm start`: starts the app
- `npm test`: runs tests
- `npm run test:i`: runs tests in debug mode
- `npm run dev:watch`: starts the app, restarts on file changes
- `npm run test:watch`: runs tests, reruns on file changes

&nbsp;  
&nbsp;

## TODOs and known limitations,

1. Better parsing of emails in notifications

   Email addresses in the notification string sent to `/api/retrievefornotifications` _must_ be surrounded by spaces. e.g. No emails will be extracted from the notification `Hello @kenny@students.com! Have a nice day.` as the `!` will be considered as a part of the email address and subsequently fail the database lookup.

2. Retrieve sensitive information (eg. database passwords) from environment variables instead of source code

3. Use docker compose to bring up the application in a single command

4. Investigate why jest does not terminate gracefully on test runs

5. Check for database conneciton on application startup

&nbsp;  
&nbsp;

## Addional convenience "admin" endpoints

These were added as an alternative to using the mariadb shell to check the database state.

1. Add teachers(s) to system

- Endpoint: `PUT /api/teacher`
- Headers: `Content-Type: application/json`
- Request body example:

```json
[
  "mrs.streibel@teachers.com",
  "mr.garrison@teachers.com",
  "mr.mackey@teachers.com"
]
```

- Success response status: HTTP 200
- Success response example

```json
{
  "message": "3 teachers(s) inserted"
}
```

2. Add student(s) to system

- Endpoint: `PUT /api/student`
- Headers: `Content-Type: application/json`
- Success response status: HTTP 204
- Request body example:

```json
[
  "kenny@students.com",
  "eric@students.com",
  "kyle@students.com",
  "stan@students.com",
  "wendy@students.com",
  "bebe@students.com"
]
```

- Success response status: HTTP 200
- Success response example

```json
{
  "message": "6 student(s) inserted"
}
```
