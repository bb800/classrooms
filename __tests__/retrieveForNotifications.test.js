const request = require('supertest');
const app = require('../server/app');
const { DataError } = require('../server/db/errors');

jest.mock('../server/db/repository');
const { classroomRepository } = require('../server/db/repository');

const consoleError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = consoleError;
});

describe('/api/retrievefornotifications', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('POST: should respond with 200', async () => {
    const data = [
      'bebe@students.com',
      'eric@students.com',
      'kenny@students.com',
      'kyle@students.com',
      'wendy@students.com',
    ];

    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'mr.mackey@teachers.com',
        notification:
          'Hello @kenny@students.com @eric@students.com ! we want to inform you that @kyle@students.com has joined the class',
      });

    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toStrictEqual('mr.mackey@teachers.com');
    expect(mockFn.mock.calls[0][1]).toStrictEqual([
      'kenny@students.com',
      'eric@students.com',
      'kyle@students.com',
    ]);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      recipients: data,
    });
  });

  test('POST: should respond with 200 when notification is a string without mentions', async () => {
    const data = [
      'bebe@students.com',
      'eric@students.com',
      'kenny@students.com',
    ];

    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'mrs.streibel@teachers.com',
        notification: 'Hello World',
      });

    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toStrictEqual('mrs.streibel@teachers.com');
    expect(mockFn.mock.calls[0][1]).toStrictEqual([]);
    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      recipients: data,
    });
  });

  test('POST: should respond with 400 when no teacher is specified', async () => {
    const data = [
      'bebe@students.com',
      'eric@students.com',
      'kenny@students.com',
      'kyle@students.com',
      'wendy@students.com',
    ];

    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        notification: 'Hello @kenny@students.com',
      });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'teacher email string must be supplied in request body',
      },
    });
  });

  test('POST: should respond with 400 when teacher is not a string', async () => {
    const data = ['kyle@students.com', 'wendy@students.com'];

    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: {},
        notification: 'Hello @kenny@students.com',
      });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'teacher email string must be supplied in request body',
      },
    });
  });

  test('POST: should respond with 400 when notification is not a string', async () => {
    const data = ['bebe@students.com', 'eric@students.com'];

    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockResolvedValue(data);

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'mr.mackey@teachers.com',
        notification: [],
      });

    expect(mockFn.mock.calls.length).toBe(0);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'notification string must be supplied in request body',
      },
    });
  });

  test('POST: should respond with 400 when there is a data error and forward the error message', async () => {
    const mockFn = classroomRepository.retrieveForNotifications;
    mockFn.mockImplementation(() => {
      throw new DataError(400, 'mock error');
    });

    const { body, statusCode } = await request(app)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'mr.mackey@teachers.com',
        notification: 'hello @kenny@students.com , today is good day.',
      });

    expect(mockFn.mock.calls.length).toBe(1);
    expect(statusCode).toBe(400);
    expect(body).toStrictEqual({
      error: {
        code: 400,
        message: 'mock error',
      },
    });
  });
});
