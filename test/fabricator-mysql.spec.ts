import * as mysql from 'mysql';
import { Fabricator } from '../src/fabricator';
import { MySQLAdaptor } from '../src/mysql-adaptor';
import { exec } from 'child_process';
import { expect } from 'chai';

let dbConfig = {
  host: 'localhost',
  user: 'dev',
  password: 'test',
  database: 'fabricator_test'
};
let conn = mysql.createConnection(dbConfig);

describe('MySQLAdaptor', () => {
  before((done) => {
    Fabricator.setAdaptor(new MySQLAdaptor({ conn: conn }));

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

    let cmd = `mysql -u ${dbConfig.user} --password=${dbConfig.password} < ./test/sql/create-tables.mysql.sql`;
    exec(cmd, function(error, stdout, stderr) {
      if (error) console.log(error);
      done();
    });
  });

  it('creates nested entries in database', (done) => {
    Fabricator.fabricate('user')
    .then((user) => {
      expect(user.firstName).to.equal('Bob');
      expect(user.username).to.equal('Bob.Smith');
      conn.query('SELECT * FROM department WHERE id = ?', user.departmentId, (err, res) => {
        if (err) console.log(err);
        let dept = res[0];
        expect(dept.name).to.equal('IT');
        conn.query('SELECT * FROM organization WHERE id = ?', dept.organizationId, (err, res) => {
          if (err) console.log(err);
          let org = res[0];
          expect(org.name).to.equal('Fabricator Inc');
          done();
        });
      });
    });
  });
});
