const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/journal', isLoggedIn, async (req, res) => {
  const { title, content, imageUrl } = req.body;

  try {
    const newJournalEntry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        imageUrl,
        user: { connect: { id: req.user.id } },
      },
    });

    res.status(201).json(newJournalEntry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create journal entry' });
  }
});

router.get('/user/journal', isLoggedIn, async (req, res) => {
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(journalEntries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch journal entries' });
  }
});

router.put('/user/journal/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { title, content, imageUrl } = req.body;

  try {
    const updatedJournalEntry = await prisma.journalEntry.update({
      where: { id },
      data: { title, content, imageUrl },
    });

    res.status(200).json(updatedJournalEntry);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update journal entry' });
  }
});

router.delete('/user/journal/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.journalEntry.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete journal entry' });
  }
});
