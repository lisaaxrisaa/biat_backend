const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/budget', isLoggedIn, async (req, res) => {
  const { name, category, amount, currency, date, tripType } = req.body;

  try {
    const newBudgetItem = await prisma.budget.create({
      data: {
        name,
        category,
        amount,
        currency,
        date: new Date(date),
        tripType,
        user: { connect: { id: req.user.id } },
      },
    });

    res.status(201).json(newBudgetItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add budget item' });
  }
});

router.get('/user/budget', isLoggedIn, async (req, res) => {
  try {
    const budgetList = await prisma.budget.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(budgetList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budget' });
  }
});

router.put('/user/budget/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, category, amount, currency, date, tripType } = req.body;

  try {
    const updatedBudgetItem = await prisma.budget.update({
      where: { id },
      data: {
        name,
        category,
        amount,
        currency,
        date: new Date(date),
        tripType,
      },
    });
    res.status(200).json(updatedBudgetItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget item' });
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
    res.status(500).json({ message: 'Failed to delete budget item' });
  }
});
