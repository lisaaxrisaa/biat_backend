const { express } = require("./common");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(require("morgan")("dev"));

app.use("/", require("./api/auth"));

app.use((err, req, res, next) => {
  console.error(err.stack); // error log output 
  res.status(500).json({ message: 'Something went wrong.' }); // error response
});

app.listen(PORT, () => {
  console.log(`I am listening on PORT ${PORT}`);
});
