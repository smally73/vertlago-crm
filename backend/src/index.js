require('dotenv').config();
const express = require('express');
require('express-async-errors'); // fait remonter les rejets async au middleware d'erreur ci-dessous
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_ORIGIN) {
  throw new Error('FRONTEND_ORIGIN doit être défini en production (sinon CORS retomberait sur *).');
}

const app = express();

// Le backend tourne derrière Nginx en prod (docker-compose.prod.yml) : sans
// ça, express-rate-limit verrait l'IP de Nginx pour toutes les requêtes.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.disable('x-powered-by');

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessaie dans quelques minutes.' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Gestion d'erreurs générique
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Vertlago CRM en écoute sur le port ${PORT}`);
});
