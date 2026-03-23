const express = require('express');
const router = express.Router();
const Message = require('../models/message.js');
const { requireLogin } = require('./auth');

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.send(loginPage());
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.send(loginPage('❌ Invalid username or password.'));
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/dashboard', requireLogin, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  const unread = messages.filter(m => !m.isRead).length;
  res.send(dashboardPage(messages, unread));
});

router.post('/messages/:id/read', requireLogin, async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { isRead: true });
  res.redirect('/admin/dashboard');
});

router.post('/messages/:id/delete', requireLogin, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
});

function loginPage(error = '') {
  return `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8"/>
  <title>Admin Login</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#1a1410;min-height:100vh;display:flex;align-items:center;justify-content:center;}
    .card{background:#f5f0e8;padding:3rem;width:100%;max-width:420px;}
    h2{font-size:1.6rem;color:#1a1410;margin-bottom:0.3rem;}
    .sub{font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#7a6e62;margin-bottom:2rem;}
    label{display:block;font-size:0.7rem;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:#7a6e62;margin-bottom:0.4rem;}
    input{width:100%;padding:0.8rem 1rem;background:#fff;border:1px solid #d9c9a8;font-family:'DM Sans',sans-serif;font-size:0.95rem;outline:none;margin-bottom:1.2rem;}
    input:focus{border-color:#c0512f;}
    button{width:100%;padding:0.9rem;background:#c0512f;color:#f5f0e8;border:none;font-size:0.85rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;}
    button:hover{background:#1a1410;}
    .error{background:#fde8e8;color:#c0512f;padding:0.8rem 1rem;margin-bottom:1.2rem;font-size:0.85rem;border-left:3px solid #c0512f;}
  </style>
</head>
<body>
  <div class="card">
    <h2>Harsh Sharma</h2>
    <div class="sub">Admin Dashboard</div>
    ${error ? `<div class="error">${error}</div>` : ''}
    <form method="POST" action="/admin/login">
      <label>Username</label>
      <input type="text" name="username" placeholder="Enter username" required autofocus/>
      <label>Password</label>
      <input type="password" name="password" placeholder="Enter password" required/>
      <button type="submit">Login →</button>
    </form>
  </div>
</body></html>`;
}

function dashboardPage(messages, unread) {
  const rows = messages.map(m => `
    <tr style="background:${m.isRead ? '#fff' : '#fff8f5'}">
      <td style="padding:1rem;border-bottom:1px solid #f0e8dc">
        <div style="font-weight:600">${m.name}</div>
        <div style="font-size:0.82rem;color:#7a6e62">${m.email}</div>
      </td>
      <td style="padding:1rem;border-bottom:1px solid #f0e8dc;max-width:300px">
        <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px">${m.message}</div>
      </td>
      <td style="padding:1rem;border-bottom:1px solid #f0e8dc;font-size:0.8rem;color:#7a6e62;white-space:nowrap">
        ${new Date(m.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
      </td>
      <td style="padding:1rem;border-bottom:1px solid #f0e8dc">
        ${!m.isRead
          ? `<span style="background:#c0512f;color:#fff;font-size:0.6rem;padding:0.2rem 0.5rem;text-transform:uppercase">NEW</span>`
          : `<span style="background:#e8f5e9;color:#4a7c59;font-size:0.6rem;padding:0.2rem 0.5rem;text-transform:uppercase">READ</span>`}
      </td>
      <td style="padding:1rem;border-bottom:1px solid #f0e8dc">
        <div style="display:flex;gap:0.5rem">
          ${!m.isRead ? `
          <form method="POST" action="/admin/messages/${m._id}/read">
            <button style="padding:0.35rem 0.8rem;background:#1a1410;color:#f5f0e8;border:none;font-size:0.72rem;text-transform:uppercase;cursor:pointer">Mark Read</button>
          </form>` : ''}
          <form method="POST" action="/admin/messages/${m._id}/delete" onsubmit="return confirm('Delete?')">
            <button style="padding:0.35rem 0.8rem;background:#fff;color:#c0512f;border:1px solid #c0512f;font-size:0.72rem;text-transform:uppercase;cursor:pointer">Delete</button>
          </form>
        </div>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8"/>
  <title>Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#f5f0e8;}
    header{background:#1a1410;padding:1.2rem 2rem;display:flex;justify-content:space-between;align-items:center;}
    .logo{font-size:1.2rem;font-weight:700;color:#f5f0e8;}
    .logout{color:#d9c9a8;text-decoration:none;font-size:0.78rem;letter-spacing:0.12em;text-transform:uppercase;border:1px solid rgba(217,201,168,0.3);padding:0.4rem 1rem;}
    .logout:hover{color:#c0512f;border-color:#c0512f;}
    .container{max-width:1100px;margin:0 auto;padding:2.5rem 2rem;}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-bottom:2.5rem;}
    .stat{background:#fff;padding:1.5rem 2rem;border-left:4px solid #c0512f;}
    .stat-num{font-size:2.5rem;font-weight:900;color:#1a1410;line-height:1;}
    .stat-label{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#7a6e62;margin-top:0.3rem;}
    h2{font-size:1.4rem;font-weight:700;color:#1a1410;margin-bottom:1.2rem;}
    .table-wrap{background:#fff;border:1px solid #d9c9a8;overflow-x:auto;}
    table{width:100%;border-collapse:collapse;}
    th{padding:0.9rem 1rem;text-align:left;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#7a6e62;background:#fdfaf5;border-bottom:2px solid #d9c9a8;}
    .empty{padding:3rem;text-align:center;color:#7a6e62;}
  </style>
</head>
<body>
  <header>
    <div class="logo">Harsh Sharma — Dashboard</div>
    <a href="/admin/logout" class="logout">Logout</a>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat"><div class="stat-num">${messages.length}</div><div class="stat-label">Total Messages</div></div>
      <div class="stat"><div class="stat-num" style="color:#c0512f">${unread}</div><div class="stat-label">Unread</div></div>
      <div class="stat"><div class="stat-num">${messages.length - unread}</div><div class="stat-label">Read</div></div>
    </div>
    <h2>All Messages</h2>
    <div class="table-wrap">
      ${messages.length === 0
        ? '<div class="empty">No messages yet! Share your portfolio.</div>'
        : `<table>
            <thead><tr>
              <th>From</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>${rows}</tbody>
           </table>`}
    </div>
  </div>
</body></html>`;
}

module.exports = router;