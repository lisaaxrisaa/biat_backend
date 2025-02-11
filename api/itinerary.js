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
      include: {
        activities: true,
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

// router.put('/user/itinerary/:id', isLoggedIn, async (req, res) => {
//   const { id } = req.params;
//   const {
//     tripName,
//     startDate,
//     endDate,
//     type,
//     name,
//     description,
//     date,
//     time,
//     activities,
//   } = req.body;

//   try {
//     const updatedItinerary = await prisma.itinerary.update({
//       where: { id },
//       data: {
//         tripName,
//         startDate: new Date(startDate),
//         endDate: new Date(endDate),
//         type,
//         name,
//         description,
//         date: new Date(date),
//         time,
//         activities: {
//           // Loop over activities to either update or create
//           update: activities.map((activity) => ({
//             where: { id: activity.id }, // Use the provided activity id
//             data: {
//               name: activity.name,
//               description: activity.description,
//               activityTime: activity.activityTime,
//               location: activity.location,
//             },
//           })),
//           create: activities
//             .filter((activity) => !activity.id) // Only create activities that don't have an id
//             .map((activity) => ({
//               name: activity.name,
//               description: activity.description,
//               activityTime: activity.activityTime,
//               location: activity.location,
//               itineraryId: id,
//             })),
//         },
//       },
//     });

//     res.status(200).json(updatedItinerary);
//   } catch (error) {
//     console.error('Error updating itinerary:', error);
//     res.status(500).json({ message: 'Failed to update itinerary' });
//   }
// });

router.put('/user/itinerary/:id', isLoggedIn, async (req, res) => {
  console.log('Received PUT data:', req.body); // Log the received body for debugging
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
    // Check if activities data exists and has valid fields
    if (activities) {
      console.log('Activities:', activities); // Log activities to ensure they are correct
    }

    // Upsert the activities data
    const activityUpsertData = activities?.map((activity) => {
      if (activity.id) {
        return {
          where: { id: activity.id },
          update: {
            name: activity.name,
            description: activity.description,
            activityTime: activity.activityTime,
            location: activity.location,
          },
        };
      } else {
        return {
          create: {
            name: activity.name,
            description: activity.description,
            activityTime: activity.activityTime,
            location: activity.location,
            itineraryId: id,
          },
        };
      }
    });

    // Proceed to update itinerary
    const updatedItinerary = await prisma.itinerary.update({
      where: { id },
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
          upsert: activityUpsertData,
        },
      },
    });

    res.status(200).json(updatedItinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error);
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
    res.status(200).send({ message: 'Itinerary successfully deleted' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ message: 'Failed to delete itinerary' });
  }
});
