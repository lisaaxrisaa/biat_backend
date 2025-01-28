const { express } = require('./common');
const app = express();
const PORT = 3003;
app.use(express.json());
app.use(require('morgan')('dev'));

app.use('/', require('./api/auth'));

app.listen(PORT, () => {
  console.log(`I am listening on PORT ${PORT}`);
});
