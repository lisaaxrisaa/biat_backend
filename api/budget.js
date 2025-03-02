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

router.get('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;

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

router.put('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, tripType, currency, date, amount, categories } = req.body;

  try {
    if (!name || !tripType || !currency || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
      include: { categories: true }, 
    });

    if (!existingBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const categoryIdsInRequest = categories.map((category) => category.id);
    const categoriesToDelete = existingBudget.categories.filter(
      (category) => !categoryIdsInRequest.includes(category.id)
    );

    await Promise.all(
      categoriesToDelete.map(async (category) => {
        await prisma.category.delete({
          where: { id: category.id },
        });
      })
    );

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        tripType,
        currency,
        amount,
        date: new Date(date),
      },
    });

    if (Array.isArray(categories) && categories.length > 0) {
      await Promise.all(
        categories.map(async (category) => {
          await prisma.category.upsert({
            where: { id: category.id || '' },
            update: {
              name: category.name,
              budgeted: category.budgeted,
              actual: category.actual,
              difference: category.budgeted - category.actual,
            },
            create: {
              name: category.name,
              budgeted: category.budgeted,
              actual: category.actual,
              difference: category.budgeted - category.actual,
              budgetId: id,
            },
          });
        })
      );
    }

    const finalBudget = await prisma.budget.findUnique({
      where: { id },
      include: { categories: true },
    });

    res.status(200).json(finalBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      message: 'Unable to edit/update budget!',
      error: error.message,
      stack: error.stack,
    });
  }
});


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
