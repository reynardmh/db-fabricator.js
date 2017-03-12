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
with another template name.

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
let fabId = Fabricator.getId;
let org            = Fabricator.fabricate('organization');
let dept_it        = Fabricator.fabricate('department', { name: 'IT',        organizationId: fabId(org) });
let dept_marketing = Fabricator.fabricate('department', { name: 'Marketing', organizationId: fabId(org) });
let user_bob       = Fabricator.fabricate('user', { firstName: 'Bob',  departmentId: fabId(dept_it) });
let user_jane      = Fabricator.fabricate('user', { firstName: 'Jane', departmentId: fabId(dept_it) });
let user_jon       = Fabricator.fabricate('user', { firstName: 'Jon',  departmentId: fabId(dept_marketing) });
let user_mary      = Fabricator.fabricate('user', { firstName: 'Mary', departmentId: fabId(dept_marketing) });
```

`Fabricator.getId` is a helper function which will return the id of the resolved promise. It can be passed a promise or
just the object from which you want to get the id.

```
// In the above example
fabId(org)

// is the same as
org.then(o => o.id)
```

## Extensible

Currently db-fabricator only supports MySQL data store, but you can create an adaptor for any database.
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
