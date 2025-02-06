const { express, router, axios } = require('../common');
module.exports = router;

const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

router.get('/', async (req, res) => {
  console.log('Request received for location:', req.query.location);
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  console.log(`Request received for location: ${location}`);

  try {
    const response = await axios.get(
      `${BASE_URL}${location}/today?key=${API_KEY}&unitGroup=us&elements=name,temp,feelslike,humidity,precip,precipprob,windspeed,cloudcover,sunrise,sunset,moonphase,conditions&include=current,days&contentType=json`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Full Error:', error);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});
