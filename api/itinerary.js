const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/itinerary', isLoggedIn, async (req, res) => {
  const { tripName, startDate, endDate, type, name, description, date, time } =
    req.body;

  try {
    const newItinerary = await prisma.itinerary.create({
      data: {
        tripName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        name,
        description,
        date: new Date(date),
        time,
        user: { connect: { id: req.user.id } },
      },
    });
    res.status(201).json(newItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add itinerary' });
  }
});

router.get('/user/itinerary', isLoggedIn, async (req, res) => {
  try {
    const itineraries = await prisma.itinerary.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itineraries' });
  }
});

router.put('/user/itinerary/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { tripName, startDate, endDate, type, name, description, data, time } =
    req.body;

  try {
    const updatedItinerary = await prisma.itinerary.update({
      where: {
        id,
      },
      data: {
        tripName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        name,
        description,
        date: new Date(data),
        time,
      },
    });
    res.status(200).json(updatedItinerary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update itinerary' });
  }
});

router.delete('/user/itinerary/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.itinerary.delete({
      where: {
        id,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete itinerary' });
  }
});
