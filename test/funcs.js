const expect = require('chai').expect;
const db = (require('..'))();

describe('Database functions', () => {
	it('create keyspace and use it', () => {
		return db.create_keyspace('testspace');
	});

	it('create table', () => {
		return db.create_table('testtable', {
			key: 'uuid primary key',
			value: 'text'
		});
	});
});
