const { Repository } = require('../server/db/repository');
const { getTestConnectionPool } = require('../server/db/configurations');
const { sortResultsBy2Keys, filterObject } = require('../server/utils/compare');

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
      ("mr.garrison@teachers.com"),
      ("mr.mackey@teachers.com"),
      ("mrs.streibel@teachers.com")`,
    noop
  );

  await testRepository.executeQuery(
    `insert into students (email)
    values
      ("bebe@students.com"),
      ("eric@students.com"),
      ("kenny@students.com"),
      ("kyle@students.com"),
      ("stan@students.com"),
      ("wendy@students.com")`,
    noop
  );
});

afterAll(() => {
  console.error = consoleError;

  return testRepository.close();
});

describe('Repository - Registrations table', () => {
  test('registerStudents(...) should register kyle to mr garrison', async () => {
    await testRepository.registerStudents(noop, {
      teacher: 'mr.garrison@teachers.com',
      students: ['kyle@students.com'],
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
      .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

    const expected = [
      {
        teacher_email: 'mr.garrison@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
    ];

    expect(results.length).toEqual(1);
    expect(actualSorted).toStrictEqual(expected);
  });

  test('registerStudents(...) should register kyle and eric to mrs streibel', async () => {
    await testRepository.registerStudents(noop, {
      teacher: 'mrs.streibel@teachers.com',
      students: ['kyle@students.com', 'eric@students.com'],
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
      .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

    const expected = [
      {
        teacher_email: 'mr.garrison@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mrs.streibel@teachers.com',
        student_email: 'eric@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mrs.streibel@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
    ];

    expect(results.length).toEqual(3);
    expect(actualSorted).toStrictEqual(expected);
  });

  test('registerStudents(...) should register wendy, kyle and eric to mr mackey', async () => {
    await testRepository.registerStudents(noop, {
      teacher: 'mr.mackey@teachers.com',
      students: [
        'kyle@students.com',
        'eric@students.com',
        'wendy@students.com',
      ],
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
      .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

    const expected = [
      {
        teacher_email: 'mr.garrison@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mr.mackey@teachers.com',
        student_email: 'eric@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mr.mackey@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mr.mackey@teachers.com',
        student_email: 'wendy@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mrs.streibel@teachers.com',
        student_email: 'eric@students.com',
        student_suspended: 0,
      },
      {
        teacher_email: 'mrs.streibel@teachers.com',
        student_email: 'kyle@students.com',
        student_suspended: 0,
      },
    ];

    expect(results.length).toEqual(6);
    expect(actualSorted).toStrictEqual(expected);
  });
});
