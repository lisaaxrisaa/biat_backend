const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');

router.post('/user/budget', isLoggedIn, async (req, res) => {
  const { name, tripType, currency, date, amount, categories } = req.body;
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  try {
    // difference calculation so that calculations are done in the backend not the backend
    const categoriesDifference = categories.map((category) => ({
      name: category.name,
      budgeted: category.budgeted,
      actual: category.actual,
      difference: category.budgeted - category.actual,
    }));
    const newBudget = await prisma.budget.create({
      data: {
        name,
        tripType,
        currency,
        date: new Date(date),
        amount,
        user: { connect: { id: req.user.id } },
        categories: {
          create: categoriesDifference,
        },
      },
    });
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Failed to add budget' });
  }
});
// the following route gets a list of the users budgets
router.get('/user/budget', isLoggedIn, async (req, res) => {
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
    res.status(500).json({ message: 'Unable to fetch budget list!' });
  }
});
// the following route gets a specific budget for the user to view (by the id)
router.get('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  console.log("Recieved budget with id: ", id); //remove if error is resolved
  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });
    if (!budget) {
      return res.status(404).json({ message: 'No such budget found.' });
    }
    res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch budget!' });
  }
});

// the following file allows users to edit budget details
router.put('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, tripType, currency, date, amount, categories } = req.body;

  const categoriesDifference = categories.map((category) => ({
    name: category.name,
    budgeted: category.budgeted,
    actual: category.actual,
    difference: category.budgeted - category.actual,
  }));

  // use deleteMany to fix duplicate categories error
  try {
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        tripType,
        currency,
        amount,
        date: new Date(date),
        categories: {
          deleteMany: {},
          create: categoriesDifference.map((category) => ({
            name: category.name,
            budgeted: category.budgeted,
            actual: category.actual,
            difference: category.budgeted - category.actual,
            budget: { connect: { id } },
          })),
        },
      },
      include: {
        categories: true,
      },
    });

    res.status(200).json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget: ", error);
    res.status(500).json({ message: "Unable to edit/update budget!" });
  }
});

// following router allows users to delete budgets s
router.delete('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.budget.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete budget!' });
  }
});
// the following route creates a new category for a specific budget
router.post('/user/budget/:id/category', isLoggedIn, async (req, res) => {
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
    res.status(500).json({ message: 'Unable to create category' });
  }
});
// the following route edits a specific category within a specific budget
router.put(
  '/user/budget/:budgetId/category/:categoryId',
  isLoggedIn,
  async (req, res) => {
    const { budgetId, categoryId } = req.params;
    const { name, budgeted, actual } = req.body;
    try {
      const budgetExists = await prisma.budget.findUnique({
        where: { id: budgetId },
      });
      if (!budgetExists) {
        return res.status(404).json({ message: 'Budget not found' });
      }

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
      res.status(500).json({ message: 'Unable to edit category!' });
    }
  }
);
// the following route handles deleting a specific route from a specific budget
router.delete(
  '/user/budget/:budgetId/category/:categoryId',
  isLoggedIn,
  async (req, res) => {
    const { budgetId, categoryId } = req.params;
    try {
      await prisma.category.delete({
        where: { id: categoryId },
      });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Unable to delete category!' });
    }
  }
);

module.exports = router;
