const expect = require('chai').expect;
const db = (require('..'))();

describe('Database proxy', () => {
	it('execute function', () => {
		return db.execute('select key from system.local')
		.then(res => {
			expect(res.first()['key']).to.equal('local');
		});
	});

	it('eachRow function', () => {
		var length = 0;

		return db.eachRow(
			'select key from system.local',
			null,
			(i, row) => {
				length++;
				expect(row).to.have.property('key');
			}
		)
		.then(res => {
			expect(length).to.be.least(1);
			expect(length).to.equal(res.rowLength);
		});
	});
});
