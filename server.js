const { express, axios, prisma } = require('./common');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(require('morgan')('dev'));

app.use(
  cors({
    origin: ['http://localhost:5173', 'biatbackend-production.up.railway.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

app.use('/api/auth', require('./api/auth'));
app.use('/api/budget', require('./api/budget'));
app.use('/api/itinerary', require('./api/itinerary'));
app.use('/api/journal', require('./api/journal'));
app.use('/api/packing-list', require('./api/packingList'));
app.use('/api/weather', require('./api/weather'));
app.use('/api/flight', require('./api/flight'));
app.use('/api/destination', require('./api/destination'));

app.get('/', (req, res) => {
  res.send('Welcome to the backend API');
});

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`I am listening on PORT ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  prisma.$disconnect();
  process.exit(0);
});
