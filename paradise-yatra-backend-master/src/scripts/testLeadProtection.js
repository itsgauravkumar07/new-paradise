// Checks the enquiry spam guard (5 per visitor per hour) and duplicate detection without a database:
// the Lead model's database calls are replaced with in-memory stand-ins.
//   node src/scripts/testLeadProtection.js

const assert = require('node:assert/strict');
const Lead = require('../models/Lead');

const saved = [];
Lead.findOne = (query) => ({
  lean: async () =>
    saved.find(
      (l) =>
        l.phone === query.phone &&
        (typeof query.packageTitle === 'string' ? l.packageTitle === query.packageTitle : !l.packageTitle) &&
        l.createdAt >= query.createdAt.$gte
    ) || null,
});
Lead.prototype.save = async function save() {
  this.createdAt = new Date();
  saved.push(this.toObject());
  return this;
};

const { createLead } = require('../controllers/leadController');

const call = async (body, ip) => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (data) => ((res.body = data), res);
  await createLead({ body, headers: { 'x-forwarded-for': ip }, ip: '127.0.0.1' }, res);
  return res;
};

(async () => {
  const lead = (n) => ({ fullName: 'Test', phone: `+91987654320${n}`, packageTitle: `Package ${n}`, source: 'chatbot' });

  // Duplicate: same phone + package again is not saved twice
  const first = await call(lead(0), '10.0.0.1');
  assert.equal(first.statusCode, 201);
  const again = await call(lead(0), '10.0.0.1');
  assert.equal(again.statusCode, 200);
  assert.equal(again.body.duplicate, true);
  assert.equal(saved.length, 1, 'the duplicate was not saved');
  console.log('PASS  same enquiry twice -> saved once, second reply says duplicate');

  // Rate limit: 5 different enquiries per visitor per hour, the 6th is refused
  for (let n = 1; n <= 4; n++) assert.equal((await call(lead(n), '10.0.0.1')).statusCode, 201);
  const sixth = await call(lead(5), '10.0.0.1');
  assert.equal(sixth.statusCode, 429);
  console.log('PASS  6th enquiry from the same visitor within an hour -> 429');

  // Another visitor is not affected
  assert.equal((await call(lead(6), '10.0.0.2')).statusCode, 201);
  console.log('PASS  a different visitor can still send enquiries');

  console.log('\n3 passed, 0 failed');
  process.exit(0);
})().catch((error) => {
  console.error('FAIL ', error.message);
  process.exit(1);
});
