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

router.get('/test-prisma', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    console.log('🔍 Prisma Users:', users); // ✅ This should print all users

    res.status(200).json(users);
  } catch (error) {
    console.error('🔥 Prisma error:', error);
    res.status(500).json({ error: 'Prisma query failed' });
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    console.log(`Created email ${email} and password ${password}`);
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
    // if (newUser.id) {
    //   console.log('User created successfully:', newUser);
    //   const token = createToken(newUser.id);
    //   res.status(201).json({ token, user: newUser });
    // } else {
    //   res.status(400).json({ message: 'Please try again.' });
    // }
    console.log('New User:', newUser);
    if (!newUser || !newUser.id) {
      console.error('User creation failed.');
      return res.status(400).json({ message: 'Please try again.' });
    }
    const token = createToken(newUser.id);
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    console.log(`📨 Received registration request for email: ${email}`);

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    console.log(`🔑 Password hashed for user: ${email}`);

    // Create user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashPassword, // ✅ Store hashed password
      },
      select: {
        // ✅ Only return safe fields
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    console.log('🚀 Prisma created user:', newUser); // ✅ Log the new user object

    // ✅ Ensure user creation was successful
    if (!newUser || !newUser.id) {
      console.error('❌ User creation failed.');
      return res
        .status(400)
        .json({ message: 'User registration failed. Please try again.' });
    }

    // Generate authentication token
    const token = createToken(newUser.id);
    console.log('✅ Token generated for user:', newUser.id); // ✅ Confirm token

    // Prepare response object
    const responsePayload = { token, user: newUser };
    console.log('📤 Sending response to frontend:', responsePayload); // ✅ Log final response

    // Send response
    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('🔥 Error in /register route:', error); // ✅ Log errors
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
    res.status(400).json({ error: 'Email is already in use' });
  }
  res.status(500).json({ error: 'Failed to update user' });
});
