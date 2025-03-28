require('dotenv').config();
const { express, router, axios } = require('../common');

const searchDestination = async (query) => {
  const options = {
    method: 'GET',
    url: 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination',
    params: { query },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.data[0]?.id || null;
  } catch (error) {
    console.error('Error searching destination:', error.message);
    return null;
  }
};

router.get('/search', async (req, res) => {
  const {
    fromQuery,
    toQuery,
    departDate,
    returnDate,
    adults,
    cabinClass,
    currency_code,
  } = req.query;

  if (!fromQuery || !toQuery || !departDate || !adults || !currency_code) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const fromId = await searchDestination(fromQuery);
  const toId = await searchDestination(toQuery);

  if (!fromId || !toId) {
    return res.status(400).json({ error: 'Invalid location queries' });
  }

  const options = {
    method: 'GET',
    url: 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights',
    params: {
      fromId,
      toId,
      departDate,
      returnDate: returnDate || undefined,
      adults: parseInt(adults),
      cabinClass: cabinClass || 'ECONOMY',
      currency_code,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    console.log('API Response Summary:', {
      status: response.data?.status,
      message: response.data?.message,
      totalFlights: response.data?.data?.flightOffers?.length || 0,
      firstFlight: response.data?.data?.flightOffers?.[0] || 'No flights found',
    });

    const flightOffers = response.data?.data?.flightOffers || [];

    if (flightOffers.length === 0) {
      console.warn('⚠️ No flights found.');
    }

    const formattedFlights = flightOffers.map((offer) => {
      const firstSegment = offer.segments?.[0] || {};
      const lastSegment = offer.segments?.slice(-1)[0] || {};
      const firstLeg = firstSegment.legs?.[0] || {};
      const returnSegment =
        offer.segments?.length > 1 ? offer.segments[1] : null;

      const allCabinClasses = offer.segments
        .flatMap((segment) => segment.legs.map((leg) => leg.cabinClass))
        .join(', ');

      return {
        airline: firstLeg.carriersData?.[0]?.name || 'Unknown',
        airlineLogo: firstLeg.carriersData?.[0]?.logo || '',
        flightNumber: firstLeg.flightInfo?.flightNumber || 'N/A',
        departureAirport: firstSegment.departureAirport?.name || 'Unknown',
        departureCode: firstSegment.departureAirport?.code || 'N/A',
        arrivalAirport: lastSegment.arrivalAirport?.name || 'Unknown',
        arrivalCode: lastSegment.arrivalAirport?.code || 'N/A',
        departureTime: firstSegment.departureTime || 'Unknown',
        arrivalTime: lastSegment.arrivalTime || 'Unknown',
        returnDepartureTime: returnSegment?.departureTime || null,
        returnArrivalTime: returnSegment?.arrivalTime || null,
        price: offer.priceBreakdown?.total?.units || 'Not Available',
        currency: offer.priceBreakdown?.total?.currencyCode || 'USD',
        cabinClass: allCabinClasses || 'Unknown',
        bookingLink: `https://www.booking.com/flights?offerToken=${offer.token}`,
      };
    });

    res.json({ flights: formattedFlights });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

module.exports = router;
