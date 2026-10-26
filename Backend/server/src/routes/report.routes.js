const express = require('express');
const { z } = require('zod');
const { submitReport } = require('../controllers/report.controller');
const validate = require('../middleware/validate');

const router = express.Router();

const reportSchema = z.object({
  channel: z.enum(['sms', 'email', 'call', 'whatsapp', 'other']),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required' })
  }),
  contact: z.string().max(100).optional()
});

router.post('/', validate(reportSchema), submitReport);

module.exports = router;
