const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/packing-lists', isLoggedIn, async (req, res) => {
  const { name, destination, departureDate, returnDate, category, notes } =
    req.body;
  try {
    const newPackingList = await prisma.packingList.create({
      data: {
        name,
        userId: req.user.id,
        destination,
        departureDate: departureDate ? new Date(departureDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        category,
        notes,
      },
    });
    res.status(201).json(newPackingList);
  } catch (error) {
    console.error('Error creating packing list:', error);
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
    console.error('Error fetching packing lists:', error);
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
    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }
    res.status(200).json(packingList);
  } catch (error) {
    console.error('Error fetching packing list:', error);
    res.status(500).json({ message: 'Failed to fetch packing list' });
  }
});

router.put('/user/packing-lists/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { name, destination, departureDate, returnDate, category, notes } =
    req.body;
  try {
    const updatedPackingList = await prisma.packingList.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(destination && { destination }),
        ...(departureDate && { departureDate: new Date(departureDate) }),
        ...(returnDate && { returnDate: new Date(returnDate) }),
        ...(category && { category }),
        ...(notes && { notes }),
      },
    });
    res.status(200).json(updatedPackingList);
  } catch (error) {
    console.error('Error updating packing list:', error);
    res.status(500).json({ message: 'Failed to update packing list' });
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
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item' });
  }
});

router.delete('/user/packing-lists/:listId', isLoggedIn, async (req, res) => {
  const { listId } = req.params;

  try {
    await prisma.$transaction([
      prisma.packingItem.deleteMany({ where: { packingListId: listId } }),
      prisma.packingList.delete({ where: { id: listId } }),
    ]);
    res.sendStatus(204);
  } catch (error) {
    console.error(`Error deleting packing list: ${error.message || error}`);
    res.status(500).json({ message: 'Failed to delete packing list' });
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
      console.error('Error deleting packing item:', error);
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
      console.error('Error updating item:', error);
      res.status(500).json({ message: 'Failed to update item' });
    }
  }
);
