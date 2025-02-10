const { prisma, express, router } = require('../common');
const { isLoggedIn } = require('./authMiddleware');
module.exports = router;

router.post('/user/itinerary', isLoggedIn, async (req, res) => {
  const {
    tripName,
    startDate,
    endDate,
    type,
    name,
    description,
    date,
    time,
    activities,
  } = req.body;

  console.log('Request Body:', req.body);

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
        activities: {
          create: activities.map((activity) => ({
            name: activity.name,
            description: activity.description,
            activityTime: activity.activityTime,
            location: activity.location,
          })),
        },
      },
    });
    res.status(201).json(newItinerary);
  } catch (error) {
    console.error('Error creating itinerary:', error);
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

router.get('/user/itinerary/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  console.log('Backend received ID:', id);
  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: {
        id: id,
      },
    });
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch itinerary' });
  }
});

router.put('/user/itinerary/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const {
    tripName,
    startDate,
    endDate,
    type,
    name,
    description,
    date,
    time,
    activities,
  } = req.body;

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
        date: new Date(date),
        time,
        activities: {
          upsert: activities.map((activity) => ({
            where: { id: activity.id || '' },
            update: activity,
            create: activity,
          })),
        },
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
