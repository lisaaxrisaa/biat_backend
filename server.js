const { express, axios } = require('./common');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(require('morgan')('dev'));

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

app.use('/api/auth', require('./api/auth'));
app.use('/api/budget', require('./api/budget'));
app.use('/api/checklist', require('./api/checklist'));
app.use('/api/itinerary', require('./api/itinerary'));
app.use('/api/journal', require('./api/journal'));
app.use('/api/packing-list', require('./api/packingList'));
app.use('/api/weather', require('./api/weather'));

app.get('/', (req, res) => {
  res.send('Welcome to the backend API');
});

app.use((req, res, next) => {
  console.log('Response Headers:', res.getHeaders());
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`I am listening on PORT ${PORT}`);
});
