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

  test('GET: should respond with 200 and a students array', async () => {
    const data = ['foo', 'bar', 'baz'];
    classroomRepository.getCommonStudents.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .get('/api/commonStudents')
      .query({ teacher: 'test1' });

    expect(classroomRepository.getCommonStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ students: data });
  });

  test('GET: should respond with 200 and a students array when multiple teacher params are given', async () => {
    const data = ['foo', 'bar', 'baz'];
    classroomRepository.getCommonStudents.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .get('/api/commonStudents')
      .query({ teacher: ['test1', 'test2', 'test3'] });

    expect(classroomRepository.getCommonStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({ students: data });
  });

  test('GET: should respond with 400 and an error mesage when no teacher parameter is sent', async () => {
    const { body, statusCode } = await request(app).get('/api/commonStudents');

    expect(classroomRepository.getCommonStudents.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'At least 1 teacher query param is required',
      },
    });
  });

  test('GET: should respond with 400 when 1 or more teachers have no registered students', async () => {
    classroomRepository.getCommonStudents.mockImplementation(() => {
      throw new Error('mock error');
    });

    const { body, statusCode } = await request(app)
      .get('/api/commonStudents')
      .query({ teacher: 'test1' });

    expect(classroomRepository.getCommonStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'mock error',
      },
    });
  });

  test('GET: should respond with 500 when database returns an unknown error', async () => {
    classroomRepository.getCommonStudents.mockImplementation(() => {
      const error = new Error();
      error.errno = 999;
      throw error;
    });

    const { body, statusCode } = await request(app)
      .get('/api/commonStudents')
      .query({ teacher: 'test1' });

    expect(classroomRepository.getCommonStudents.mock.calls.length).toBe(1);
    expect(statusCode).toBe(500);
    expect(body).toStrictEqual({
      error: {
        code: 500,
        message: 'Unknown error occured',
      },
    });
  });
});
