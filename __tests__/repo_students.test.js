const { Repository } = require('../server/db/repository');
const { getTestConnectionPool } = require('../server/db/configurations');
const { sortResultsByKey, filterObject } = require('../server/utils/compare');

const testRepository = new Repository(getTestConnectionPool());
const noop = () => {};
const consoleError = console.error;

beforeAll(async () => {
  console.error = jest.fn();

  await testRepository.executeQuery('delete from registrations', noop);
  await testRepository.executeQuery('delete from teachers', noop);
  await testRepository.executeQuery('delete from students', noop);
});

afterAll(() => {
  console.error = consoleError;
});

describe('Repository - Students table', () => {
  test('enrollStudents() should insert students into the database', async () => {
    await testRepository.enrollStudents(noop, ['foo', 'bar', 'baz']);

    const results = await testRepository.executeQuery(
      'select * from students',
      noop
    );

    // filter out id and sort
    const studentData = results
      .map((student) => filterObject(student, ['email', 'suspended']))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(3);
    expect(studentData).toStrictEqual([
      { email: 'bar', suspended: 0 },
      { email: 'baz', suspended: 0 },
      { email: 'foo', suspended: 0 },
    ]);
  });

  test('getStudents() should retrieve students from the database', async () => {
    const results = await testRepository.getStudents(noop);

    // filter out id and sort
    const studentData = results
      .map((student) => filterObject(student, ['email', 'suspended']))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(3);
    expect(studentData).toStrictEqual([
      { email: 'bar', suspended: 0 },
      { email: 'baz', suspended: 0 },
      { email: 'foo', suspended: 0 },
    ]);
  });
});
