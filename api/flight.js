require('dotenv').config();
const { express, router, axios } = require('../common');
module.exports = router;

const searchDestination = async (query) => {
  const options = {
    method: 'GET',
    url: 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination',
    params: {
      query,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.data[0]?.id;
  } catch (error) {
    console.error(
      'Error searching destination:',
      error.response?.data || error.message
    );
    return null;
  }
};

router.get('/search', async (req, res) => {
  const { fromQuery, toQuery, departDate, adults, currency_code } = req.query;

  if (!fromQuery || !toQuery || !departDate || !adults || !currency_code) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const fromId = await searchDestination(fromQuery);
  const toId = await searchDestination(toQuery);

  if (!fromId || !toId) {
    console.error(
      `Invalid locations - From: ${fromQuery} (${fromId}), To: ${toQuery} (${toId})`
    );
    return res.status(400).json({
      error: 'Invalid location queries',
      details: { fromQuery, fromId, toQuery, toId },
    });
  }

  const options = {
    method: 'GET',
    url: 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights',
    params: {
      fromId,
      toId,
      departDate,
      adults: isNaN(parseInt(adults)) ? 1 : parseInt(adults),

      currency_code,
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching flights:',
      error.response?.data || error.message
    );
    res.status(500).json({
      error: 'Failed to fetch flights',
      details: error.response?.data || error.message,
    });
  }
});
