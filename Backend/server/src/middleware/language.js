const VALID_LANGUAGES = ['en', 'hi', 'mr'];

const language = (req, res, next) => {
  const langQuery = req.query.lang;
  
  if (!langQuery || !VALID_LANGUAGES.includes(langQuery)) {
    req.lang = 'en'; // fallback
  } else {
    req.lang = langQuery;
  }
  
  next();
};

module.exports = language;
