const { prisma, express, router } = require("../common");
const { isLoggedIn } = require("./authMiddleware");

router.post("/user/budget", isLoggedIn, async (req, res) => {
  const { name, tripType, currency, date, categories } = req.body;

  try {
    const newBudget = await prisma.budget.create({
      data: {
        name,
        tripType,
        currency,
        date: new Date(date),
        user: { connect: { id: req.user.id } },
        categories: {
          create: categories.map((category) => ({
            name: category.name,
            budgeted: category.budgeted,
            actual: category.actual,
            difference: category.budgeted - category.actual,
          })),
        },
      },
    });
    res.status(201).json(newBudget);
  } catch (error) {
    console.error(error);
  }
});
// the following route gets a list of the users budgets
router.get("/user/budget", isLoggedIn, async (req, res) => {
  try {
    const budgetList = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: {
        categories: true,
      },
    });
    res.status(200).json(budgetList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to fetch budget list!" });
  }
});

// the following file allows users to edit budget details
router.put("/user/budget/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, tripType, currency, date, categories } = req.body;

  try {
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        tripType,
        currency,
        date: new Date(date),
        categories: {
          deleteMany: {},
          categories: categories.map((category) => ({
            name: category.name,
            budgeted: category.budgeted,
            actual: category.actual,
            difference: (category.budgeted = category.actual),
          })),
        },
      },
      include: {
        categories: true,
      },
    });
    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error(error);
  }
});

// following router allows users to delete budgets s
router.delete("/user/budget/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.budget.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to delete budget!" });
  }
});
// the following route creates a new category for a specific budget
router.post("/user/budget/:id/category", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, budgeted, actual } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        budgeted,
        actual,
        difference: budgeted - actual,
        budget: { connect: { id } },
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create category" });
  }
});
// the following route edits a specific category within a specific budget
router.put(
  "/user/budget/:budgetId/category/:categoryId",
  isLoggedIn,
  async (req, res) => {
    const { budgetId, categoryId } = req.params;
    const { name, budgeted, actual } = req.body;
    try {
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name,
          budgeted,
          actual,
          difference: budgeted - actual,
          budget: { connect: { id: budgetId } },
        },
      });
      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to edit category!" });
    }
  }
);
// the following route handles deleting a specific route from a specific budget
router.delete(
  "/user/budget/:budgetId/category/:categoryId",
  isLoggedIn,
  async (req, res) => {
    const { budgetId, categoryId } = req.params;
    try {
      await prisma.category.delete({
        where: { id: categoryId },
      });
      res.status(204).send;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to delete category!" });
    }
  }
);

module.exports = router;
