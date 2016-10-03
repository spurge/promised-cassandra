const cassandra = require('..');
const expect = require('chai').expect;
const q = require('q');

describe('Database connection', () => {
	it('with defaults', () => {
		return cassandra().connection.then(client => {
			expect(client.options.contactPoints)
			.to.include.members(['127.0.0.1']);
		});
	});

	it('with plain options object', () => {
		return cassandra({
			contactPoints: ['localhost']
		}).connection.then(client => {
			expect(client.options.contactPoints)
			.to.include.members(['localhost']);
		});
	});

	it('with options within a promise', () => {
		return cassandra(q({
			contactPoints: ['localhost']
		})).connection.then(client => {
			expect(client.options.contactPoints)
			.to.include.members(['localhost']);
		});
	});
});
