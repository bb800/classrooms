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

describe('Admin APIs - /api/students', () => {
  test('GET: should respond with an array', async () => {
    const mockFn = jest.fn();
    mockFn.mockResolvedValue(['foo', 'bar', 'baz']);
    classroomRepository.getStudents = mockFn;

    const { body, statusCode } = await request(app).get('/api/students');

    expect(mockFn.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      data: ['foo', 'bar', 'baz'],
    });
  });

  test('PUT: should respond with message when insertion succeeds', async () => {
    const mockFn = jest.fn();
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send(['foo', 'bar', 'baz']);

    expect(mockFn.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: '3 student(s) inserted',
    });
  });

  test('PUT: should respond with an error if an empty array is sent', async () => {
    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send([]);

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
    const mockFn = jest.fn();
    mockFn.mockImplementation(() => {
      const error = new Error();
      error.errno = 1062;
      throw error;
    });
    classroomRepository.runQueryOnPool = mockFn;

    const { body, statusCode } = await request(app)
      .put('/api/students')
      .send(['error']);

    expect(mockFn.mock.calls.length).toBe(1);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message:
          '1 or more students already enrolled in the system! Please try again with students not in the system',
      },
    });
  });
});
