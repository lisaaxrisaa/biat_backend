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

// Create login endpoint:
// reqs: user enters email & password, use bcrypt for password comparison,
// return JSON web token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const match = bcrypt.compare(password, user.password);
    if (match) {
      const token = createToken(user.id);
      return res.json({ token });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/aboutMe', isLoggedIn, async (req, res, next) => {
  try {
    let response;

    if (!req.user) {
      res.status(401).json({ message: 'Not Authorized' });
    } else {
      response = await prisma.user.findFirstOrThrow({
        where: {
          id: req.user.id,
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/allUsers', isLoggedIn, async (req, res, next) => {
  try {
    let response;

    if (!req.user) {
      res.status(401).json({ message: 'Not Authorized' });
    } else {
      response = await prisma.user.findMany({
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/single-user', isLoggedIn, async (req, res, next) => {
  try {
    const response = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
      select: {
        first_name: true,
        last_name: true,
        email: true,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(401).send({ message: 'Not authorized.' });
  }
});
// delete endpoint for the user

router.delete('/users/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const targetUserId = req.params.id;

  if (userId !== targetUserId) {
    return res.status(403).json({ message: 'You do not have permission to delete this user.' });
  }

  try {
    await prisma.user.delete({
      where: { id: targetUserId },
    });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});

module.exports = router;

//middleware for authentication

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// update endpoint for user to update email, first name, last name, and password

router.put('/users/:id', authMiddleware, async (req, res) => {
  const userId = req.params.id;
  const { email, password, firstName, lastName } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        email: email || undefined,
        password: password || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;

// only authenticated users can access the route. This middleware should verify the user's token and extract the user's ID from the token payload.

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
