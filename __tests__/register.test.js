const request = require('supertest');
const app = require('../server/app');

jest.mock('../server/db/repository');
const { classroomRepository } = require('../server/db/repository');

const consoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = consoleError;
});

describe('/api/register', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('POST: should respond with 204', async () => {
    const { body, statusCode } = await request(app)
      .post('/api/register')
      .send({
        teacher: 'test',
        students: ['foo', 'bar', 'baz'],
      });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(204);
    expect(body).toStrictEqual({});
  });

  test('POST: should respond with error if request does not contain teachers', async () => {
    const { body, statusCode } = await request(app)
      .post('/api/register')
      .send({
        students: ['foo', 'bar', 'baz'],
      });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'teacher key with email is required',
      },
    });
  });

  test('POST: should respond with error if request does not contain students', async () => {
    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
    });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'student key with array of at least 1 student email is required',
      },
    });
  });

  test('POST: should respond with error if request contains empty students array', async () => {
    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
      students: [],
    });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(0);
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
    const { body, statusCode } = await request(app).post('/api/register').send({
      teacher: 'test',
      students: 'test',
    });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'student key with array of at least 1 student email is required',
      },
    });
  });

  test('POST: should respond with a 500 error when database returns an unknown error', async () => {
    classroomRepository.registerStudents.mockImplementation(() => {
      const error = new Error();
      error.errno = 999;
      throw error;
    });

    const { body, statusCode } = await request(app)
      .post('/api/register')
      .send({
        teacher: 'test',
        students: ['foo', 'bar', 'baz'],
      });

    expect(classroomRepository.registerStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(500);
    expect(body).toStrictEqual({
      error: {
        code: 500,
        message: 'Unknown error occured',
      },
    });
  });
});
