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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      console.error('Registration failed: Email already in use.');
      return res.status(400).json({ message: 'Email already in use.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashPassword,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });
    if (!newUser || !newUser.id) {
      console.error('User creation failed.');
      return res
        .status(400)
        .json({ message: 'User registration failed. Please try again.' });
    }
    const token = createToken(newUser.id);
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Error in /register route:', error);
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
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        password: true,
      },
    });
    if (!user) {
      console.error('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.password) {
      return res.status(500).json({ message: 'Password not found for user' });
    }
    const match = bcrypt.compare(password, user.password);
    if (!match) {
      console.error('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = createToken(user.id);
    res.status(200).json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
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

router.delete('/user', isLoggedIn, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not Authorized' });
    } else {
      await prisma.user.delete({
        where: { id: req.user.id },
      });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

router.put('/user/update', isLoggedIn, async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  try {
    let updateData = { email, first_name, last_name };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: updateData,
      select: {
        email: true,
        first_name: true,
        last_name: true,
      },
    });
    res
      .status(200)
      .json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email is already in use' });
    }
  }
  res.status(500).json({ error: 'Failed to update user' });
});
