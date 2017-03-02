# DB Fabricator

Convenient way to populate your database, mainly for setting up e2e testing data.

## Install

```
$ npm install db-fabricator
```

## Usage

### Setup

```
import { Fabricator, MySQLAdaptor } from 'db-fabricator';
import * as mysql from 'mysql';

let conn = mysql.createConnection({
  host: 'localhost',
  user: 'dev',
  password: 'pass',
  database: 'dbname'
});

Fabricator.setAdaptor(new MySQLAdaptor({conn: conn}));
```

### Defining Template

Define template for each of the data type (table if you are using relational DB).
The base template name has to be the table name.

```typescript

Fabricator.template({
  name: 'organization',
  attr: {
    name: 'Fabricator Inc'
  }
});
Fabricator.template({
  name: 'department',
  attr: {
    name: 'IT',
    organizationId: () => Fabricator.fabricate('organization').then(org => org.id)
  }
});
Fabricator.template({
  name: 'user',
  attr: {
    firstName: 'Bob',
    lastName: 'Smith',
    username: (obj) => `${obj.firstName}.${obj.lastName}`,
    departmentId: () => Fabricator.fabricate('department').then(dept => dept.id)
  }
});
```

You can define template from another template by specifying `from` property
with the base template name.

```typescript
Fabricator.template({
  name: 'user-teacher',
  from: 'user',
  attr: {
    type: 'teacher'
  }
});
Fabricator.template({
  name: 'user-student',
  from: 'user',
  attr: {
    type: 'student'
  }
});
Fabricator.template({
  name: 'user-student-with-email',
  from: 'user-student',
  attr: {
    email: (obj) => `${obj.username}@student.school.edu`,
  }
});
```

### Populate data from template

Conveniently populate data from the template. You can still override any attribute from the template.

```typescript
Fabricator.fabricate('user', { firstName: 'Bob' }); // Department and organization will be automatically created for the user
Fabricator.fabricate('user', { firstName: 'Jon' }); // Jon will have different department and organization
Fabricator.fabricate('user-student-with-email', { firstName: 'Dan' });
```

If you want to use the same department/organization for some users:

```typescript
Fabricator.fabricate('organization')
.then((org) => {
  Fabricator.fabricate('department', { name: 'IT', organizationId: org.id })
  .then((dept) => {
    Fabricator.fabricate('user', { firstName: 'Bob', departmentId: dept.id });
    Fabricator.fabricate('user', { firstName: 'Jane', departmentId: dept.id });
  })
  Fabricator.fabricate('department', { name: 'Marketing', organizationId: org.id })
  .then((dept) => {
    Fabricator.fabricate('user', { firstName: 'Jon', departmentId: dept.id });
    Fabricator.fabricate('user', { firstName: 'Mary', departmentId: dept.id });
  })
});
```

## Extensible

Currently Fabricator.js supports MySQL data store, but you can create an adaptor for any database.
Just implement a class that implements the `DataStoreAdaptor` interface. For an example, see the
`MySQLAdaptor` implementation.

```typescript
export interface DataStoreAdaptor {
  createData(tableName: string, finalAttr: Object): Promise<any>;
}
```

## Build

```
$ tsc
```

## Running Test

Install ts-node to run the test without compiling to js first.

```
$ npm install -g ts-node
```

Run all tests

```
$ mocha --compilers ts:ts-node/register test/*
```

Run the main test

```
$ mocha --compilers ts:ts-node/register test/fabricator.spec.ts
```

Run the mysql-adaptor test

```
$ mocha --compilers ts:ts-node/register test/fabricator-mysql.spec.ts
```

You have to have a mysql instance running and a user that can create/drop database.

## License

MIT
