const { Repository } = require('../server/db/repository');
const { getTestConnectionPool } = require('../server/db/configurations');
const { sortResultsByKey } = require('../server/utils/compare');

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

describe('Repository - Teachers table', () => {
  test('enrollTeachers() should insert teachers into the database', async () => {
    await testRepository.enrollTeachers(noop, ['foo', 'bar', 'baz']);

    const results = await testRepository.executeQuery(
      'select * from teachers',
      noop
    );

    // filter out id and sort
    const teacherData = results
      .map((teacher) => ({ email: teacher.email }))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(3);
    expect(teacherData).toStrictEqual([
      { email: 'bar' },
      { email: 'baz' },
      { email: 'foo' },
    ]);
  });

  test('getTeachers() should retrieve teachers from the database', async () => {
    const results = await testRepository.getTeachers(noop);

    // filter out id and sort
    const teacherData = results
      .map((teacher) => ({ email: teacher.email }))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(3);
    expect(teacherData).toStrictEqual([
      { email: 'bar' },
      { email: 'baz' },
      { email: 'foo' },
    ]);
  });
});
