const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const dataTemplatesDir = path.join(__dirname, '..', 'data_templates');

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function initializeData() {
  try {
    let rawUsers = await loadCSV(path.join(dataTemplatesDir, 'users.csv'));
    let rawTickets = await loadCSV(path.join(dataTemplatesDir, 'tickets.csv'));
    let rawAssets = await loadCSV(path.join(dataTemplatesDir, 'assets.csv'));

    // Limit records as requested by user
    rawUsers = rawUsers.slice(0, 250);
    rawAssets = rawAssets.slice(0, 500);
    rawTickets = rawTickets.slice(0, 1000);

    // Process Users (give them IDs, maybe string-based or just use a counter)
    // Actually, using a numeric string counter is safe. Or just use their email as ID.
    // Let's use numeric IDs to be safe and build a lookup map.
    const userMapByEmail = {};
    const users = rawUsers.map((u, index) => {
      const id = (index + 1).toString();
      const user = {
        id,
        name: u.Name,
        email: u.Email,
        role: u.Role === 'IT Engineer' ? 'Engineer' : (u.Role === 'IT Manager' ? 'Admin' : u.Role),
        department: u.Department
      };
      userMapByEmail[u.Email] = user;
      return user;
    });

    // Make sure we have our standard demo users with IDs 1, 2, 3 so login works if user tries them
    // Wait, let's just make sure the demo emails exist in users, or we can just prepend them.
    // The user's CSV might not have john.doe@intec.com.
    // Let's force add them to ensure the demo login always works if the CSV doesn't have them.
    const demoUsers = [
      { id: 'demo1', name: 'John Doe', email: 'john.doe@intec.com', role: 'Employee', department: 'Sales' },
      { id: 'demo2', name: 'Jane Smith', email: 'jane.smith@intec.com', role: 'Engineer', department: 'IT Support' },
      { id: 'demo3', name: 'Admin User', email: 'admin@intec.com', role: 'Admin', department: 'Management' }
    ];
    demoUsers.forEach(du => {
      if (!userMapByEmail[du.email]) {
        users.unshift(du);
        userMapByEmail[du.email] = du;
      }
    });

    // Process Tickets
    const tickets = rawTickets.map((t, index) => {
      const requestedBy = userMapByEmail[t.Requested_By_Email]?.id || null;
      const assignedTo = userMapByEmail[t.Assigned_To_Email]?.id || null;
      return {
        id: (index + 1000).toString(),
        title: t.Title,
        description: t.Description,
        priority: t.Priority === 'Critical' ? 'High' : t.Priority,
        status: (t.Status === 'Closed' || t.Status === 'Cancelled') ? 'Resolved' : t.Status,
        requestedBy,
        assignedTo,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString() // Random past date
      };
    });

    // Process Assets
    const assets = rawAssets.map((a, index) => {
      const assignedTo = userMapByEmail[a.Assigned_To_Email]?.id || null;
      return {
        id: (index + 100).toString(),
        name: a.Asset_Name,
        type: a.Asset_Type,
        serialNumber: a.Serial_Number,
        status: a.Status,
        assignedTo
      };
    });

    return { users, tickets, assets };

  } catch (error) {
    console.error('Error loading CSV data:', error);
    return { users: [], tickets: [], assets: [] };
  }
}

module.exports = { initializeData };
