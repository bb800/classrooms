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

describe('Admin APIs - /api/students', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('GET: should respond with an array', async () => {
    classroomRepository.getStudents.mockResolvedValue(['foo', 'bar', 'baz']);

    const { body, statusCode } = await request(app).get('/api/students');

    expect(classroomRepository.getStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      data: ['foo', 'bar', 'baz'],
    });
  });

  test('PUT: should respond with message when insertion succeeds', async () => {
    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send(['foo', 'bar', 'baz']);

    expect(classroomRepository.enrollStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: '3 student(s) inserted',
    });
  });

  test('PUT: should respond with an error if an empty array is sent', async () => {
    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send([]);

    expect(classroomRepository.enrollStudents.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'At least 1 student email should be supplied as a json array in request body',
      },
    });
  });

  test('PUT: should respond with an error if record already exists in db', async () => {
    classroomRepository.enrollStudents.mockImplementation(() => {
      const error = new Error();
      error.errno = 1062;
      throw error;
    });

    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send(['error']);

    expect(classroomRepository.enrollStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          '1 or more students already enrolled in the system! Please try again with students not in the system',
      },
    });
  });

  test('PUT: should respond with an error db responds with unknown error code', async () => {
    classroomRepository.enrollStudents.mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send(['error']);

    expect(classroomRepository.enrollStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(500);
    expect(body).toStrictEqual({
      error: {
        code: 500,
        message: 'Unknown error occured',
      },
    });
  });
});
