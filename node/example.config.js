var config = {
  JWT: 'random_secret_key',
  SMTP: {
    host: 'smtp.gmail.com',
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
