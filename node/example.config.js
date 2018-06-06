var config = {
  JWT: '',
  SMTP: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  },
  DB: process.env.DATABASE_URL
};

module.exports = config;
