const { Repository } = require('../../server/db/repository');
const { getTestConnectionPool } = require('../../server/db/configurations');
const {
  sortResultsByKey,
  filterObject,
} = require('../../server/utils/compare');

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

describe('Repository - Students table', () => {
  test('enrollStudents(...) should insert students into the database', async () => {
    await testRepository.enrollStudents(['foo', 'bar', 'baz']);

    const results = await testRepository.executePoolQuery(
      'select * from students'
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
    const results = await testRepository.getStudents();

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

  test('suspendStudent(...) should a student in the database', async () => {
    await testRepository.suspendStudent('foo');

    const results = await testRepository.getStudents();

    // filter out id and sort
    const studentData = results
      .map((student) => filterObject(student, ['email', 'suspended']))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(3);
    expect(studentData).toStrictEqual([
      { email: 'bar', suspended: 0 },
      { email: 'baz', suspended: 0 },
      { email: 'foo', suspended: 1 },
    ]);
  });

  test('getMentionedStudents(...) should retrieve students and suspension status from the database', async () => {
    const results = await testRepository.getStudentRecords(['foo', 'bar']);

    // filter out id and sort
    const studentData = results
      .map((student) => filterObject(student, ['email', 'suspended']))
      .sort(sortResultsByKey('email'));

    expect(results.length).toEqual(2);
    expect(studentData).toStrictEqual([
      { email: 'bar', suspended: 0 },
      { email: 'foo', suspended: 1 },
    ]);
  });
});
