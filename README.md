# Addional Admin endpoints

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
