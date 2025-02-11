// changes made:
// removed parseInt and integer as we are passing id as a string
// - Added additional console.errors for error messages
// - Added console.logs to ensure middleware for specific user is handling well
// - Changed placement of module.exports for better handling (export everything at the same time)
const { prisma, express, router } = require("../common");
const { isLoggedIn } = require("./authMiddleware");

router.post("/user/journal", isLoggedIn, async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: "Failed to create journal entry" });
  }
});

router.get("/user/journal", isLoggedIn, async (req, res) => {
  console.log("User making request:", req.user);
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(journalEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch journal entries" });
  }
});

router.put("/user/journal/:id", isLoggedIn, async (req, res) => {
  console.log("User making request:", req.user);
  const { id } = req.params;
  const { title, content, imageUrl } = req.body;

  try {
    const updatedJournalEntry = await prisma.journalEntry.update({
      where: { id },
      data: { title, content, imageUrl },
    });

    res.status(200).json(updatedJournalEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update journal entry" });
  }
});

router.delete("/user/journal/:id", isLoggedIn, async (req, res) => {
  console.log("User making request:", req.user);
  const { id } = req.params;

  try {
    await prisma.journalEntry.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete journal entry" });
  }
});

module.exports = router;
