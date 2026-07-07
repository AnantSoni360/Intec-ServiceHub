const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('companyName', 'Test Company');
    formData.append('userName', 'Test User');
    formData.append('email', 'testuser@example.com');
    formData.append('password', 'password123');

    const usersFile = new Blob([fs.readFileSync(path.join(__dirname, 'frontend/public/data_templates/users.csv'))], { type: 'text/csv' });
    const assetsFile = new Blob([fs.readFileSync(path.join(__dirname, 'frontend/public/data_templates/assets.csv'))], { type: 'text/csv' });
    const ticketsFile = new Blob([fs.readFileSync(path.join(__dirname, 'frontend/public/data_templates/tickets.csv'))], { type: 'text/csv' });

    formData.append('users', usersFile, 'users.csv');
    formData.append('assets', assetsFile, 'assets.csv');
    formData.append('tickets', ticketsFile, 'tickets.csv');

    console.log('Sending request...');
    const res = await fetch('http://localhost:5000/api/onboarding/register-and-upload', {
      method: 'POST',
      body: formData
    });

    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testUpload();
