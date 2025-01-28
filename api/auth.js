const { hash } = require('bcrypt');
const { prisma, express, router, bcrypt, jwt } = require('../common');
const JWT_SECRET = process.env.JWT_SECRET;
module.exports = router;

const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '24h' });
};

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id,
      },
    });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};

router.post('/register', async (req, res, next) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    console.log(`Created email ${email} and password ${password}`);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const response = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashPassword,
      },
    });
    if (response.id) {
      const token = createToken(response.id);
      res.status(201).json({ token });
    } else {
      res.status(400).json({ message: 'Please try again.' });
    }
  } catch (error) {
    next(error);
  }
});
