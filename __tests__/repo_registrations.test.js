const { Repository } = require('../server/db/repository');
const { getTestConnectionPool } = require('../server/db/configurations');
const { sortResultsByKey, filterObject } = require('../server/utils/compare');

const testRepository = new Repository(getTestConnectionPool());
const noop = () => {};
const consoleError = console.error;

beforeAll(async () => {
  console.error = jest.fn();

  await testRepository.executeQuery('delete from registrations', noop);
  await testRepository.executeQuery('delete from students', noop);
  await testRepository.executeQuery('delete from teachers', noop);

  await testRepository.executeQuery(
    `insert into teachers (email)
    values
      ("mrs.streibel@teachers.com"),
      ("mr.garrison@teachers.com"),
      ("mr.mackey@teachers.com");`,
    noop
  );

  await testRepository.executeQuery(
    `insert into students (email)
    values
      ("kenny@students.com"),
      ("eric@students.com"),
      ("kyle@students.com"),
      ("stan@students.com"),
      ("wendy@students.com"),
      ("bebe@students.com");`,
    noop
  );
});

afterAll(() => {
  console.error = consoleError;

  return testRepository.close();
});

describe('Repository - Registrations table', () => {
  test('registerStudents() should insert records into the database', async () => {
    await testRepository.registerStudents(noop, {
      teacher: 'mr.garrison@teachers.com',
      students: ['kyle@students.com', 'stan@students.com'],
    });

    const results = await testRepository.executeQuery(
      `select teachers.email as teacher_email, students.email as student_email, students.suspended as student_suspended
        from registrations
        inner join teachers on registrations.teacher_id = teachers.id
        inner join students on registrations.student_id = students.id`,
      noop
    );

    const actualSorted = results
      .map((r) =>
        filterObject(r, ['teacher_email', 'student_email', 'student_suspended'])
      )
      .sort(sortResultsByKey('teacher_email'));

    const expected = [
      {
        teacher_email: 'mr.garrison@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mr.garrison@teachers.com',
        student_email: 'stan@students.com',
        student_suspended: 0,
      },
    ];

    expect(results.length).toEqual(2);
    expect(actualSorted).toStrictEqual(expected);
  });
});
