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

describe('Admin APIs - /api/teachers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('GET: should respond with an array', async () => {
    classroomRepository.getTeachers.mockResolvedValue(['foo', 'bar', 'baz']);

    const { body, statusCode } = await request(app).get('/api/teachers');

    expect(classroomRepository.getTeachers.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      data: ['foo', 'bar', 'baz'],
    });
  });

  test('PUT: should respond with message when insertion succeeds', async () => {
    const { body, statusCode } = await request(app)
      .put('/api/teachers')
      .send(['foo', 'bar', 'baz']);

    expect(classroomRepository.enrollTeachers.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: '3 teacher(s) inserted',
    });
  });

  test('PUT: should respond with an error if an empty array is sent', async () => {
    const { body, statusCode } = await request(app)
      .put('/api/teachers')
      .send([]);

    expect(classroomRepository.enrollTeachers.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          'At least 1 teacher email should be supplied as a json array in request body',
      },
    });
  });

  test('PUT: should respond with an error if record already exists in db', async () => {
    classroomRepository.enrollTeachers.mockImplementation(() => {
      const error = new Error();
      error.errno = 1062;
      throw error;
    });

    const { body, statusCode } = await request(app)
      .put('/api/teachers')
      .send(['error']);

    expect(classroomRepository.enrollTeachers.mock.calls.length).toBe(1);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          '1 or more teachers already enrolled in the system! Please try again with teachers not in the system',
      },
    });
  });

  test('PUT: should respond with an error db responds with unknown error code', async () => {
    classroomRepository.enrollTeachers.mockImplementation(() => {
      throw new Error();
    });

    const { body, statusCode } = await request(app)
      .put('/api/teachers')
      .send(['error']);

    expect(classroomRepository.enrollTeachers.mock.calls.length).toBe(1);
    expect(statusCode).toBe(500);
    expect(body).toStrictEqual({
      error: {
        code: 500,
        message: 'Unknown error occured',
      },
    });
  });
});
