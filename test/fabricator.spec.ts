import { Fabricator } from '../src/fabricator';
import { DataStoreAdaptor } from '../src/data-store-adaptor';
import * as Promise from 'bluebird';
import { expect } from 'chai';

class IdCounter {
  static counter: Object = {};
  static getId(name: string) {
    if (this.counter.hasOwnProperty(name)) {
      return ++this.counter[name];
    } else {
      return this.counter[name] = 1;
    }
  }
}

class MemoryDB {
  private data: Object = {};
  create(name: string, doc: any): Object {
    // console.log(doc);
    if (!this.data.hasOwnProperty(name)) {
      this.data[name] = {};
    }
    this.data[name][doc.id] = doc;
    return doc;
  }

  find(name: string, id: number): Object {
    return this.data[name][id];
  }
}
class MemoryDBAdaptor implements DataStoreAdaptor {

  constructor(public db?: MemoryDB) {}
  createData(tableName: string, finalAttr: Object): Promise<any> {
    let doc = Object.assign({}, finalAttr, { id: IdCounter.getId(tableName) });
    if (this.db) {
      this.db.create(tableName, doc)
    }
    return new Promise<any>((resolve, reject): any => {
      resolve(doc);
    });
  }
}

describe('fabricator', () => {
  let DB = new MemoryDB();
  before(() => {
    Fabricator.setAdaptor(new MemoryDBAdaptor(DB));
  });

  describe('with non async function attribute', function() {
    before(() => {
      Fabricator.clearTemplate();
      Fabricator.template({
        name: 'user',
        attr: {
          firstName: 'Bob',
          lastName: 'Smith',
          username: (obj) => `${obj.firstName}.${obj.lastName}`
        }
      });
    });

    it('creates object with composed attribute', function(done) {
      Fabricator.fabricate('user')
      .then((user) => {
        expect(user.firstName).to.equal('Bob');
        expect(user.username).to.equal('Bob.Smith');
        done();
      });
    });
    
    it('creates object with overriden attributes', function(done) {
      Fabricator.fabricate('user', { firstName: 'Jon' })
      .then((user) => {
        expect(user.firstName).to.equal('Jon');
        expect(user.username).to.equal('Jon.Smith');
        done();
      });
    });
    
    it('creates object with overidden function attribute', function(done) {
      Fabricator.fabricate('user', { firstName: 'Jon', username: 'jon123' })
      .then((user) => {
        expect(user.firstName).to.equal('Jon');
        expect(user.lastName).to.equal('Smith');
        expect(user.username).to.equal('jon123');
        done();
      });
    });
  });

  describe('with nested async function attributes', () => {
    before(() => {
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
          organizationId: () => Fabricator.fabGetId('organization')
        }
      });
      Fabricator.template({
        name: 'user',
        attr: {
          firstName: 'Bob',
          lastName: 'Smith',
          username: (obj) => `${obj.firstName}.${obj.lastName}`,
          departmentId: () => Fabricator.fabGetId('department')
        }
      });
      Fabricator.template({
        name: 'user-fulltime',
        from: 'user',
        attr: {
          type: 'fulltime'
        }
      });
      Fabricator.template({
        name: 'user-fulltime-US',
        from: 'user-fulltime',
        attr: {
          country: 'US'
        }
      });
    });

    it('creates object with composed attribute', function(done) {
      Fabricator.fabricate('user')
      .then((user) => {
        expect(user.username).to.equal('Bob.Smith');
        let dept = <any>DB.find('department', user.departmentId);
        let org  = <any>DB.find('organization', dept.organizationId);
        expect(dept.name).to.equal('IT');
        expect(org.name).to.equal('Fabricator Inc');
        done();
      });
    });

    it('create using nested templates', function(done) {
      Promise.all([
          Fabricator.fabricate('user-fulltime', { firstName: 'Tom' }),
          Fabricator.fabricate('user-fulltime-US', { firstName: 'Matt' })
      ]).spread((user1: any, user2: any) => {
        expect(user1.type).to.equal('fulltime');
        expect(user2.type).to.equal('fulltime');
        expect(user1.firstName).to.equal('Tom');
        expect(user2.firstName).to.equal('Matt');
        expect(user2.country).to.equal('US');
        done();
      });
    });

    it('create using promise as attribute', function(done) {
      let orgPromise = Fabricator.fabricate('organization');
      let deptPromise = Fabricator.fabricate('department', {
        organizationId: orgPromise.then(o => o.id)
      });
      Promise.all([orgPromise, deptPromise]).spread((org: any, dept: any) => {
        expect(dept.organizationId).to.equal(org.id);
        done();
      });
    });

  });
});

