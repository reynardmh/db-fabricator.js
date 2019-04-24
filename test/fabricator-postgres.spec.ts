import * as pg from 'pg';
import { Fabricator } from '../src/fabricator';
import { PostgresAdaptor } from '../src/postgres-adaptor';
import { exec } from 'child_process';
import { expect } from 'chai';

let dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'dev',
  password: 'test',
  database: 'fabricator_test'
};

const conn = new pg.Client(dbConfig);

describe('PostgresAdaptor', () => {
  before((done) => {
    Fabricator.setAdaptor(new PostgresAdaptor({ conn: conn }));
    Fabricator.clearTemplate();

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
        organizationId: () => Fabricator.fabricate('organization').then(o => o.id)
      }
    });
    Fabricator.template({
      name: 'user',
      attr: {
        firstName: 'Bob',
        lastName: 'Smith',
        username: (obj) => `${obj.firstName}.${obj.lastName}`,
        departmentId: () => Fabricator.fabricate('department').then(d => d.id)
      }
    });

    let cmd = `PGPASSWORD=${dbConfig.password} psql -U ${dbConfig.user} -h ${dbConfig.host} -p ${dbConfig.port} postgres < ./test/sql/create-tables.postgres.sql`;
    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        throw error;
        console.log(error);
      }
      conn.connect();
      done();
    });
  });

  it('creates nested entries in database', (done) => {
    Fabricator.fabricate('user')
    .then((user) => {
      expect(user.firstName).to.equal('Bob');
      expect(user.username).to.equal('Bob.Smith');
      conn.query('SELECT * FROM department WHERE id = $1', [user.departmentId], (err, res) => {
        if (err) console.log(err);
        let dept = res.rows[0];
        expect(dept.name).to.equal('IT');
        conn.query('SELECT * FROM organization WHERE id = $1', [dept.organizationId], (err, res) => {
          if (err) console.log(err);
          let org = res.rows[0];
          expect(org.name).to.equal('Fabricator Inc');
          done();
        });
      });
    });
  });
});
