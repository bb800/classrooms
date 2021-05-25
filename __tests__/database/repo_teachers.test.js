const { Repository } = require('../../server/db/repository');
const { getTestConnectionPool } = require('../../server/db/configurations');
const { sortResultsByKey } = require('../../server/utils/compare');

const testRepository = new Repository(getTestConnectionPool());
const consoleError = console.error;

beforeAll(async () => {
  console.error = jest.fn();

  await testRepository.executePoolQuery('delete from registrations');
  await testRepository.executePoolQuery('delete from teachers');
  await testRepository.executePoolQuery('delete from students');
});

afterAll(() => {
  console.error = consoleError;
});

describe('Repository - Teachers table', () => {
  test('enrollTeachers() should insert teachers into the database', async () => {
    await testRepository.enrollTeachers(['foo', 'bar', 'baz']);

    const results = await testRepository.executePoolQuery(
      'select * from teachers'
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
    const results = await testRepository.getTeachers();

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
