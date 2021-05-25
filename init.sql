-- create application database and user
create database if not exists classroom;
create user teacher_app identified by 'pass';
grant all on classroom.* to teacher_app;

-- create tables in application database
use classroom;

-- table definitions
create table teachers (
    id int auto_increment primary key,
    email varchar(255) not null unique
);

create table students (
    id int auto_increment primary key,
    email varchar(255) not null unique,
    suspended boolean not null default false
);

create table registrations (
    id int auto_increment primary key,
    teacher_id int not null,
    constraint fk_teacher_id
        foreign key (teacher_id) references teachers (id),
    student_id int not null,
    constraint fk_student_id
        foreign key (student_id) references students (id),
    constraint unique_registration
        unique (teacher_id, student_id)
);

-- populate application database with seed data
insert into teachers (email)
values
    ("mrs.streibel@teachers.com"),
    ("mr.garrison@teachers.com"),
    ("mr.mackey@teachers.com");

insert into students (email)
values
    ("kenny@students.com"),
    ("eric@students.com"),
    ("kyle@students.com"),
    ("stan@students.com"),
    ("wendy@students.com"),
    ("bebe@students.com");

insert into registrations(teacher_id, student_id)
values 
    (
        (select id from teachers where email = "mr.garrison@teachers.com"),
        (select id FROM students where email = "kenny@students.com")
    ),
    (
        (select id from teachers where email = "mr.garrison@teachers.com"),
        (select id FROM students where email = "eric@students.com")
    );

-- create test database and user
create database if not exists test_classroom;
create user test identified by 'pass';
grant all on test_classroom.* to test;

-- create tables in application database
use test_classroom;

-- table definitions
create table teachers (
    id int auto_increment primary key,
    email varchar(255) not null unique
);

create table students (
    id int auto_increment primary key,
    email varchar(255) not null unique,
    suspended boolean not null default false
);

create table registrations (
    id int auto_increment primary key,
    teacher_id int not null,
    constraint fk_teacher_id
        foreign key (teacher_id) references teachers (id),
    student_id int not null,
    constraint fk_student_id
        foreign key (student_id) references students (id),
    constraint unique_registration
        unique (teacher_id, student_id)
);