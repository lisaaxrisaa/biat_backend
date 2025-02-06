const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/packing-list', isLoggedIn, async (req, res) => {
  const { name, category, packed, tripType } = req.body;
  try {
    const newPackingItem = await prisma.packingList.create({
      data: {
        name,
        category,
        packed,
        tripType,
        user: { connect: { id: req.user.id } },
      },
    });
    res.status(201).json(newPackingItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add packing item' });
  }
});

router.get('/user/packing-list', isLoggedIn, async (req, res) => {
  try {
    const packingList = await prisma.packingList.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.status(200).json(packingList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packing list' });
  }
});

router.put('/user/packing-list/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, category, packed, tripType } = req.body;
  try {
    const updatedPackingItem = await prisma.packingList.update({
      where: {
        id,
      },
      data: {
        name,
        category,
        packed,
        tripType,
      },
    });
    res.status(200).json(updatedPackingItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update packing item' });
  }
});

router.delete('/user/packing-list/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.packingList.delete({
      where: {
        id,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete packing item' });
  }
});
