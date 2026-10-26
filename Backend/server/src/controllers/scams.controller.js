const scamsData = require('../data/scams.json');

const getAllScams = (req, res) => {
  const lang = req.lang;
  const scams = scamsData[lang] || scamsData['en'];

  // Return limited info for list view
  const data = scams.map(s => ({
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    image: s.image,
    severity: s.severity
  }));

  res.json({ data });
};

const getScamBySlug = (req, res, next) => {
  const lang = req.lang;
  const { slug } = req.params;
  const scams = scamsData[lang] || scamsData['en'];

  const scam = scams.find(s => s.slug === slug);

  if (!scam) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'No scam found with the provided slug'
      }
    });
  }

  res.json({ data: scam });
};

module.exports = { getAllScams, getScamBySlug };
