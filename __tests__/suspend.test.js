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

describe('/api/suspend', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('POST: should respond with 204 on success', async () => {
    const { body, statusCode } = await request(app).post('/api/suspend').send({
      student: 'foo',
    });

    expect(classroomRepository.suspendStudent.mock.calls.length).toBe(1);
    expect(statusCode).toBe(204);
    expect(body).toStrictEqual({});
  });

  test('POST: should respond with error if request does not contain a student', async () => {
    const { body, statusCode } = await request(app).post('/api/suspend').send({
      student: {},
    });

    expect(classroomRepository.suspendStudent.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'Student email must be supplied in request body',
      },
    });
  });

  test('POST: should respond with error if request does not have a body', async () => {
    const { body, statusCode } = await request(app).post('/api/suspend');

    expect(classroomRepository.suspendStudent.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'Student email must be supplied in request body',
      },
    });
  });

  test('POST: should respond with a 500 error when database returns an unknown error', async () => {
    classroomRepository.suspendStudent.mockImplementation(() => {
      const error = new Error();
      error.errno = 999;
      throw error;
    });

    const { body, statusCode } = await request(app)
      .post('/api/suspend')
      .send({ student: 'foo' });

    expect(classroomRepository.suspendStudent.mock.calls.length).toBe(1);
    expect(statusCode).toBe(500);
    expect(body).toStrictEqual({
      error: {
        code: 500,
        message: 'Unknown error occured',
      },
    });
  });
});
