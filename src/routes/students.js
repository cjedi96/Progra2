const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Student } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/students - list with pagination and search by name or carnet
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('q').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;
    const q = (req.query.q || '').trim();

    const where = {};
    if (q) {
      // crude search
      where[Symbol.for('sequelizeWhere')] = {
        [Symbol.for('sequelizeOp')]: 'OR',
        firstName: { [Symbol.for('sequelizeLike')]: `%${q}%` },
        lastName: { [Symbol.for('sequelizeLike')]: `%${q}%` },
        carnet: { [Symbol.for('sequelizeLike')]: `%${q}%` },
      };
    }

    // Sequelize v6 needs proper operators. Build using object form:
    const { Op } = require('sequelize');
    const where2 = q ? {
      [Op.or]: [
        { firstName: { [Op.like]: `%${q}%` } },
        { lastName: { [Op.like]: `%${q}%` } },
        { carnet: { [Op.like]: `%${q}%` } },
      ]
    } : {};

    const { rows, count } = await Student.findAndCountAll({ where: where2, limit, offset, order: [['id', 'ASC']] });
    res.json({
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      data: rows
    });
  }
);

// GET single
router.get('/:id',
  param('id').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  }
);

// Create (admin)
router.post('/',
  requireAdmin,
  body('firstName').isString().isLength({ min: 1 }),
  body('lastName').isString().isLength({ min: 1 }),
  body('carnet').isString().isLength({ min: 3 }),
  body('birthDate').isISO8601().toDate(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // ensure unique carnet
    const exists = await Student.findOne({ where: { carnet: req.body.carnet } });
    if (exists) return res.status(409).json({ error: 'Carnet already exists' });

    const st = await Student.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      carnet: req.body.carnet,
      birthDate: req.body.birthDate,
      isActive: req.body.isActive !== undefined ? !!req.body.isActive : true
    });
    res.status(201).json(st);
  }
);

// Update (admin)
router.put('/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  body('firstName').optional().isString().isLength({ min: 1 }),
  body('lastName').optional().isString().isLength({ min: 1 }),
  body('carnet').optional().isString().isLength({ min: 3 }),
  body('birthDate').optional().isISO8601().toDate(),
  body('isActive').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const st = await Student.findByPk(req.params.id);
    if (!st) return res.status(404).json({ error: 'Student not found' });

    if (req.body.carnet && req.body.carnet !== st.carnet) {
      const exists = await Student.findOne({ where: { carnet: req.body.carnet } });
      if (exists) return res.status(409).json({ error: 'Carnet already exists' });
    }

    await st.update(req.body);
    res.json(st);
  }
);

// Delete (admin)
router.delete('/:id',
  requireAdmin,
  param('id').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const st = await Student.findByPk(req.params.id);
    if (!st) return res.status(404).json({ error: 'Student not found' });
    await st.destroy();
    res.status(204).send();
  }
);

module.exports = router;
