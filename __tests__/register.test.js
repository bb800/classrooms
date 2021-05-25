const request = require('supertest');
const app = require('../server/app');
const { classroomRepository } = require('../server/db/repository');

const consoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = consoleError;
});

describe('/api/register', () => {
  test('POST: should respond with 204', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app)
      .post('/api/register')
      .send({
        teacher: 'test',
        students: ['foo', 'bar', 'baz'],
      });

    expect(mockFn.mock.calls.length).toBe(1);
    expect(statusCode).toBe(204);
    expect(body).toStrictEqual({});
  });

  test('POST: should respond with error if request does not contain teachers', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app)
      .post('/api/register')
      .send({
        students: ['foo', 'bar', 'baz'],
      });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'teacher key with email is required',
      },
    });
  });

  test('POST: should respond with error if request does not contain students', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
    });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'student key with array of at least 1 student email is required',
      },
    });
  });

  test('POST: should respond with error if request contain empty students array', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
      students: [],
    });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'student key with array of at least 1 student email is required',
      },
    });
  });

  test('POST: should respond with error if request contain students as string', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
      students: 'test',
    });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'student key with array of at least 1 student email is required',
      },
    });
  });
});
