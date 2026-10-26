const helplinesData = require('../data/helplines.json');

const getHelplines = (req, res) => {
  const lang = req.lang;
  const stateQuery = req.query.state;
  const helplines = helplinesData[lang] || helplinesData['en'];

  let requestedState = null;
  if (stateQuery && helplines.states[stateQuery]) {
    requestedState = helplines.states[stateQuery];
  }

  const data = {
    national: helplines.national,
    state: requestedState,
    availableStates: helplines.availableStates
  };

  res.json({ data });
};

module.exports = { getHelplines };
