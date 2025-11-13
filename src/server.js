const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');
const { port } = require('./config');
const { sequelize } = require('./db');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Swagger docs
const docPath = path.join(__dirname, '..', 'swagger.yaml');
if (fs.existsSync(docPath)) {
  const file = fs.readFileSync(docPath, 'utf8');
  const swaggerDoc = YAML.parse(file);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`DB connected. API running on http://localhost:${port}`);
    console.log(`Swagger UI at http://localhost:${port}/docs`);
  } catch (e) {
    console.error('DB connection failed:', e);
  }
});
