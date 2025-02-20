require('dotenv').config();
const { router, axios } = require('../common');
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const COUNTRIES_API_URL = 'https://restcountries.com/v3.1/all';

router.get('/generate', async (req, res) => {
  try {
    const countriesResponse = await axios.get(COUNTRIES_API_URL);

    const randomCountry =
      countriesResponse.data[
        Math.floor(Math.random() * countriesResponse.data.length)
      ];

    const destination = randomCountry.name.common;

    const wikiResponse = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        exintro: true,
        exchars: 500,
        titles: destination,
      },
    });

    const page =
      wikiResponse.data.query.pages[
        Object.keys(wikiResponse.data.query.pages)[0]
      ];
    const wikiSummary = page.extract;

    const unsplashResponse = await axios.get(
      'https://api.unsplash.com/photos/random',
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
        params: {
          query: destination,
          count: 1,
        },
      }
    );

    const imageUrl = unsplashResponse.data[0].urls.regular;

    res.json({
      destination,
      reasonsToVisit: wikiSummary,
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong!');
  }
});

module.exports = router;
