const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/packing-lists', isLoggedIn, async (req, res) => {
  const { name } = req.body;
  try {
    const newPackingList = await prisma.packingList.create({
      data: {
        name,
        userId: req.user.id,
      },
    });
    res.status(201).json(newPackingList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create packing list' });
  }
});

router.get('/user/packing-lists', isLoggedIn, async (req, res) => {
  try {
    const packingLists = await prisma.packingList.findMany({
      where: { userId: req.user.id },
      include: { items: true },
    });
    res.status(200).json(packingLists);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packing lists' });
  }
});

router.get('/user/packing-lists/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    const packingList = await prisma.packingList.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!packingList)
      return res.status(404).json({ message: 'Packing list not found' });
    res.status(200).json(packingList);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch packing list' });
  }
});

router.post('/user/packing-lists/:id/items', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  try {
    const newItem = await prisma.packingItem.create({
      data: {
        description,
        packed: false,
        packingListId: id,
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item' });
  }
});

router.delete(
  '/user/packing-lists/items/:itemId',
  isLoggedIn,
  async (req, res) => {
    const { itemId } = req.params;
    try {
      await prisma.packingItem.delete({
        where: { id: itemId },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Failed to delete packing item' });
    }
  }
);

router.put(
  '/user/packing-lists/items/:itemId',
  isLoggedIn,
  async (req, res) => {
    const { itemId } = req.params;
    const { packed, description } = req.body;
    try {
      const updatedItem = await prisma.packingItem.update({
        where: { id: itemId },
        data: {
          ...(packed !== undefined && { packed }),
          ...(description && { description }),
        },
      });
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update item' });
    }
  }
);
