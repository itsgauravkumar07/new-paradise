const express = require('express');
const router = express.Router();
const {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByCountry,
  getCountryDetails,
  getStateDetails
} = require('../controllers/locationController');

// Public routes for location data
router.get('/countries', getAllCountries);
router.get('/countries/:countryIso2', getCountryDetails);
router.get('/countries/:countryIso2/states', getStatesByCountry);
router.get('/countries/:countryIso2/states/:stateIso2', getStateDetails);
router.get('/countries/:countryIso2/states/:stateIso2/cities', getCitiesByState);
router.get('/countries/:countryIso2/cities', getCitiesByCountry);

module.exports = router;
