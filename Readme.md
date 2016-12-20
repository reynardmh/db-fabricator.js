# Fabricator.js

Convenient way to populate your database, mainly for setting up e2e testing data.

## Usage

Define template for each of the data type (table if you are using relational DB).

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
    organizationId: () => Fabricator.fabricate('organization')
  }
});
Fabricator.template({
  name: 'user',
  attr: {
    firstName: 'Bob',
    lastName: 'Smith',
    username: (obj) => `${obj.firstName}.${obj.lastName}`,
    departmentId: () => Fabricator.fabricate('department')
  }
});
```

Conveniently populate data from the template

```typescript
Fabricator.fabricate('user', { firstName: 'Bob' }); // Department and organization will be automatically created for the user
Fabricator.fabricate('user', { firstName: 'Jon' }); // Jon will have different department and organization
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

### Extensible

Currently Fabricator.js supports MySQL data store, but you can create an adaptor for any database.
Just implement a class that implements the `DataStoreAdaptor` interface. For an example, see the
`MySQLAdaptor` implementation.

```typescript
export interface DataStoreAdaptor {
  createData(tableName: string, finalAttr: Object): Promise<any>;
}
```

### Running Test

```
$ mocha --compilers ts:ts-node/register,tsx:ts-node/register test/fabricator.spec.ts
```

Run the mysql-adaptor test

```
$ mocha --compilers ts:ts-node/register,tsx:ts-node/register test/fabricator-mysql.spec.ts
```

You have to have a mysql instance running and a user that can create/drop database.

## License

MIT
