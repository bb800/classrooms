const { Repository } = require('../server/db/repository');
const { getTestConnectionPool } = require('../server/db/configurations');
const { sortResultsBy2Keys, filterObject } = require('../server/utils/compare');

const testRepository = new Repository(getTestConnectionPool());
const consoleError = console.error;

beforeAll(async () => {
  console.error = jest.fn();

  await testRepository.executePoolQuery('delete from registrations');
  await testRepository.executePoolQuery('delete from students');
  await testRepository.executePoolQuery('delete from teachers');

  await testRepository.executePoolQuery(
    `insert into teachers (email)
    values
      ("mr.garrison@teachers.com"),
      ("mr.mackey@teachers.com"),
      ("mrs.streibel@teachers.com")`
  );

  await testRepository.executePoolQuery(
    `insert into students (email)
    values
      ("bebe@students.com"),
      ("eric@students.com"),
      ("kenny@students.com"),
      ("kyle@students.com"),
      ("stan@students.com"),
      ("wendy@students.com")`
  );
});

afterAll(() => {
  console.error = consoleError;

  return testRepository.close();
});

describe('Repository - Registrations table', () => {
  describe('registerStudents(...)', () => {
    test('should register bebe to mr garrison', async () => {
      await testRepository.registerStudents('mr.garrison@teachers.com', [
        'bebe@students.com',
      ]);

      const results = await testRepository.executePoolQuery(
        `select teachers.email as teacher_email, students.email as student_email, students.suspended as student_suspended
        from registrations
        inner join teachers on registrations.teacher_id = teachers.id
        inner join students on registrations.student_id = students.id`
      );

      const actualSorted = results
        .map((r) =>
          filterObject(r, [
            'teacher_email',
            'student_email',
            'student_suspended',
          ])
        )
        .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

      const expected = [
        {
          teacher_email: 'mr.garrison@teachers.com',
          student_email: 'bebe@students.com',
          student_suspended: 0,
        },
      ];

      expect(results.length).toEqual(1);
      expect(actualSorted).toStrictEqual(expected);
    });

    test('should register kyle and eric to mrs streibel', async () => {
      await testRepository.registerStudents('mrs.streibel@teachers.com', [
        'kyle@students.com',
        'eric@students.com',
      ]);

      const results = await testRepository.executePoolQuery(
        `select teachers.email as teacher_email, students.email as student_email, students.suspended as student_suspended
        from registrations
        inner join teachers on registrations.teacher_id = teachers.id
        inner join students on registrations.student_id = students.id`
      );

      const actualSorted = results
        .map((r) =>
          filterObject(r, [
            'teacher_email',
            'student_email',
            'student_suspended',
          ])
        )
        .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

      const expected = [
        {
          teacher_email: 'mr.garrison@teachers.com',
          student_email: 'bebe@students.com',
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

    test('should register wendy, kyle and eric to mr mackey', async () => {
      await testRepository.registerStudents('mr.mackey@teachers.com', [
        'kyle@students.com',
        'eric@students.com',
        'wendy@students.com',
      ]);

      const results = await testRepository.executePoolQuery(
        `select teachers.email as teacher_email, students.email as student_email, students.suspended as student_suspended
        from registrations
        inner join teachers on registrations.teacher_id = teachers.id
        inner join students on registrations.student_id = students.id`
      );

      const actualSorted = results
        .map((r) =>
          filterObject(r, [
            'teacher_email',
            'student_email',
            'student_suspended',
          ])
        )
        .sort(sortResultsBy2Keys(['teacher_email', 'student_email']));

      const expected = [
        {
          teacher_email: 'mr.garrison@teachers.com',
          student_email: 'bebe@students.com',
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

  describe('commonStudents(...)', () => {
    test('should return an array of students to mr garrison', async () => {
      const results = await testRepository.getCommonStudents([
        'mr.garrison@teachers.com',
      ]);

      const actualSorted = results.sort();
      const expected = ['bebe@students.com'];

      expect(results.length).toEqual(1);
      expect(actualSorted).toStrictEqual(expected);
    });

    test('should return an array of students to mr mackey', async () => {
      const results = await testRepository.getCommonStudents([
        'mr.mackey@teachers.com',
      ]);

      const actualSorted = results.sort();

      const expected = [
        'eric@students.com',
        'kyle@students.com',
        'wendy@students.com',
      ];

      expect(results.length).toEqual(3);
      expect(actualSorted).toStrictEqual(expected);
    });

    test('should return an array of students common to mr mackey and mrs streibel', async () => {
      const results = await testRepository.getCommonStudents([
        'mr.mackey@teachers.com',
        'mrs.streibel@teachers.com',
      ]);

      const actualSorted = results.sort();

      const expected = ['eric@students.com', 'kyle@students.com'];

      expect(results.length).toEqual(2);
      expect(actualSorted).toStrictEqual(expected);
    });

    test('should return an empty array as there are no students common to mr garrison and mrs streibel', async () => {
      const results = await testRepository.getCommonStudents([
        'mr.garrison@teachers.com',
        'mrs.streibel@teachers.com',
      ]);

      const actualSorted = results.sort();

      const expected = [];

      expect(results.length).toEqual(0);
      expect(actualSorted).toStrictEqual(expected);
    });
  });
});
