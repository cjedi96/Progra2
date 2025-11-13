const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');
const { jwtSecret, jwtExpires } = require('../config');

const router = express.Router();

router.post('/register',
  body('username').isString().isLength({ min: 3 }),
  body('password').isString().isLength({ min: 6 }),
  body('role').optional().isIn(['user', 'admin']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password, role } = req.body;
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(409).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role: role || 'user' });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  }
);

router.post('/login',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: jwtExpires });
    res.json({ accessToken: token, tokenType: 'Bearer', expiresIn: jwtExpires });
  }
);

module.exports = router;


const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, async (req, res) => {
  res.json({ sub: req.user.sub, username: req.user.username, role: req.user.role });
});
