const https = require('https');

const data = JSON.stringify({});

const options = {
  hostname: 'oasis-backend-latest.onrender.com',
  port: 443,
  path: '/api/settings/test-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoiRmVsaXBlIE1pcmFuZGEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODMwNDQ2NzIsImV4cCI6MTc4MzA4Nzg3Mn0.Ei_V4j43sFKFQCkcTXOtAmZYl3LyKnHoW2iqivrdPjw'
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
