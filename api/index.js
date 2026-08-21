module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const app = require('../server/app');
    return app(req, res);
  } catch (err) {
    console.error('Vercel Serverless Handler Error:', err);
    return res.status(500).json({
      error: 'Internal Serverless Handler Error',
      message: err.message
    });
  }
};
