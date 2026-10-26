const { v4: uuidv4 } = require('uuid');
const { saveReport } = require('../storage/reports');

const submitReport = async (req, res, next) => {
  try {
    const { channel, message, contact, consent } = req.body;

    // Consent must be explicitly verified again even though validated, just as business rule.
    if (!consent) {
       // Should have been caught by validation, but just in case
       return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Consent is required' }});
    }

    const id = uuidv4();
    const receivedAt = new Date().toISOString();

    const report = {
      id,
      channel,
      message,
      contact: contact || null,
      consent,
      receivedAt
    };

    await saveReport(report);

    res.status(201).json({
      data: {
        id,
        receivedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { submitReport };
