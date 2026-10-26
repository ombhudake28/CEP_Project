const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('API Endpoints integration tests', async (t) => {

  await t.test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, { data: { status: 'ok' } });
  });

  await t.test('GET /api/scams returns array of scams and defaults to english', async () => {
    const res = await request(app).get('/api/scams');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.strictEqual(res.body.data.length, 3);
    assert.strictEqual(res.body.data[0].slug, 'phishing');
    assert.strictEqual(res.body.data[0].title, 'Email & Link Phishing');
  });

  await t.test('GET /api/scams?lang=hi returns hindi scams', async () => {
    const res = await request(app).get('/api/scams?lang=hi');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data[0].title, 'ईमेल और लिंक फ़िशिंग');
  });
  
  await t.test('GET /api/scams/:slug returns fine-grained scam details', async () => {
    const res = await request(app).get('/api/scams/phishing');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.slug, 'phishing');
    assert.ok(res.body.data.howItWorks);
    assert.ok(res.body.data.redFlags);
    assert.ok(res.body.data.example);
  });

  await t.test('GET /api/scams/invalid-slug returns 404', async () => {
    const res = await request(app).get('/api/scams/invalid-slug');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  await t.test('GET /api/quiz returns 8 questions', async () => {
    const res = await request(app).get('/api/quiz');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.length, 8);
  });

  await t.test('GET /api/helplines returns states properly', async () => {
    const res = await request(app).get('/api/helplines?state=MH');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.data.national);
    assert.ok(res.body.data.availableStates);
    assert.strictEqual(res.body.data.state.code, 'MH');
  });
  
  await t.test('GET /api/helplines without state returns state: null', async () => {
    const res = await request(app).get('/api/helplines');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.state, null);
  });

  await t.test('POST /api/report validates missing data', async () => {
    const res = await request(app).post('/api/report').send({});
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.length > 0);
  });
  
  await t.test('POST /api/report works properly', async () => {
    const payload = {
      channel: 'email',
      message: 'This is a test message to report a scam that happened.',
      consent: true
    };
    const res = await request(app).post('/api/report').send(payload);
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.receivedAt);
  });

  await t.test('GET /api/missing endpoint returns 404', async () => {
    const res = await request(app).get('/api/missing');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  await t.test('Rate limiting works for report endpoint', async () => {
    // Report limiter is 10 requests / 15 min. We used one above.
    const payload = { channel: 'sms', message: 'Rate limit test string for report.', consent: true };
    let finalStatus = 201;
    let finalCode = '';
    
    // We send 10 more requests, the 10th one should fail (since max is 10, total would be 11)
    for (let i = 0; i < 11; i++) {
        const res = await request(app).post('/api/report').send(payload);
        finalStatus = res.statusCode;
        if (res.body.error && res.body.error.code) {
           finalCode = res.body.error.code;
        }
    }
    
    assert.strictEqual(finalStatus, 429);
    assert.strictEqual(finalCode, 'RATE_LIMITED');
  });

});
