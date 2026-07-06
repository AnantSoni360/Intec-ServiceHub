require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  try {
    const engineer = await mongoose.connection.collection('users').findOne({ email: 'rohit.chopra1@intec-demo.com' });
    
    const token = jwt.sign(
      { id: engineer._id.toString(), name: engineer.name, email: engineer.email, role: engineer.role, companyId: engineer.companyId.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const payload = {
      title: 'Online Mode Test Ticket',
      description: 'Testing ticket creation API',
      priority: 'Medium',
      category: 'Other'
    };

    const res = await fetch(`http://localhost:${process.env.PORT || 5000}/api/tickets`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(`HTTP Status: ${res.status}`);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
run();
