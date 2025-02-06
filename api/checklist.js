const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/checklist', isLoggedIn, async (req, res) => {
  const { name, dueDate } = req.body;

  try {
    const newChecklistItem = await prisma.checklistItem.create({
      data: {
        name,
        completed: false, // Default to not completed
        dueDate: new Date(dueDate),
        user: { connect: { id: req.user.id } }, // Link to the logged-in user
      },
    });

    res.status(201).json(newChecklistItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create checklist item' });
  }
});

router.get('/user/checklist', isLoggedIn, async (req, res) => {
  try {
    const checklistItems = await prisma.checklistItem.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(checklistItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch checklist items' });
  }
});

router.put('/user/checklist/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, completed, dueDate } = req.body;

  try {
    const updatedChecklistItem = await prisma.checklistItem.update({
      where: { id },
      data: {
        name,
        completed,
        dueDate: new Date(dueDate),
      },
    });

    res.status(200).json(updatedChecklistItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update checklist item' });
  }
});

router.delete('/user/checklist/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.checklistItem.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete checklist item' });
  }
});
