const { hash } = require("bcrypt");
const { prisma, express, router, bcrypt } = require("../common");
const { createToken, isLoggedIn } = require("./authMiddleware");
module.exports = router;

router.post("/register", async (req, res, next) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      console.error("Registration failed: Email already in use.");
      return res.status(400).json({ message: "Email already in use." });
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
      console.error("User creation failed.");
      return res
        .status(400)
        .json({ message: "User registration failed. Please try again." });
    }
    const token = createToken(newUser.id);
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Error in /register route:", error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    console.log(req.body);
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
      console.error("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.password) {
      return res.status(500).json({ message: "Password not found for user" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.error("Password does not match for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
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

router.get("/aboutMe", isLoggedIn, async (req, res, next) => {
  try {
    let response;

    if (!req.user) {
      res.status(401).json({ message: "Not Authorized" });
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

router.delete('/user', isLoggedIn, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not Authorized" });
    } else {
      await prisma.user.delete({
        where: { id: req.user.id },
      });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user." });
  }
});

router.put("/user/update", isLoggedIn, async (req, res) => {
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
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email is already in use" });
    }
  }
  return res.status(500).json({ error: "Failed to update user" });
});
