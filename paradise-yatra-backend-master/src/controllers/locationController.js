const axios = require("axios");

// Get all countries from the API
const getAllCountries = async (req, res) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;
    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    const response = await axios.get(
      "https://api.countrystatecity.in/v1/countries",
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const countries = response.data.map((country) => ({
      id: country.id,
      name: country.name,
      iso2: country.iso2,
      iso3: country.iso3,
      phone_code: country.phone_code,
      capital: country.capital,
      currency: country.currency,
      currency_symbol: country.currency_symbol,
      tld: country.tld,
      native: country.native,
      region: country.region,
      subregion: country.subregion,
      timezones: country.timezones,
      latitude: country.latitude,
      longitude: country.longitude,
      emoji: country.emoji,
      emojiU: country.emojiU,
    }));

    res.json({ countries });
  } catch (error) {
    console.error("Get countries error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch countries from external API",
        error: error.response.data,
      });
    } else {
      res
        .status(500)
        .json({ message: "Server error while fetching countries" });
    }
  }
};

// Get states by country from the API
const getStatesByCountry = async (req, res) => {
  try {
    const { countryIso2 } = req.params;
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    if (!countryIso2) {
      return res.status(400).json({ message: "Country ISO2 code is required" });
    }

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryIso2}/states`,
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const states = response.data.map((state) => ({
      id: state.id,
      name: state.name,
      state_code: state.state_code,
      latitude: state.latitude,
      longitude: state.longitude,
      type: state.type,
    }));

    res.json({ states });
  } catch (error) {
    console.error("Get states error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch states from external API",
        error: error.response.data,
      });
    } else {
      res.status(500).json({ message: "Server error while fetching states" });
    }
  }
};

// Get cities by state and country from the API
const getCitiesByState = async (req, res) => {
  try {
    const { countryIso2, stateIso2 } = req.params;
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    if (!countryIso2 || !stateIso2) {
      return res
        .status(400)
        .json({ message: "Country ISO2 and State ISO2 codes are required" });
    }

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryIso2}/states/${stateIso2}/cities`,
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const cities = response.data.map((city) => ({
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    }));

    res.json({ cities });
  } catch (error) {
    console.error("Get cities error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch cities from external API",
        error: error.response.data,
      });
    } else {
      res.status(500).json({ message: "Server error while fetching cities" });
    }
  }
};

// Get cities by country from the API
const getCitiesByCountry = async (req, res) => {
  try {
    const { countryIso2 } = req.params;
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    if (!countryIso2) {
      return res.status(400).json({ message: "Country ISO2 code is required" });
    }

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryIso2}/cities`,
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const cities = response.data.map((city) => ({
      id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    }));

    res.json({ cities });
  } catch (error) {
    console.error("Get cities by country error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch cities from external API",
        error: error.response.data,
      });
    } else {
      res.status(500).json({ message: "Server error while fetching cities" });
    }
  }
};

// Get country details by ISO2 code
const getCountryDetails = async (req, res) => {
  try {
    const { countryIso2 } = req.params;
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    if (!countryIso2) {
      return res.status(400).json({ message: "Country ISO2 code is required" });
    }

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryIso2}`,
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const country = response.data;
    res.json({ country });
  } catch (error) {
    console.error("Get country details error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch country details from external API",
        error: error.response.data,
      });
    } else {
      res
        .status(500)
        .json({ message: "Server error while fetching country details" });
    }
  }
};

// Get state details by ISO2 codes
const getStateDetails = async (req, res) => {
  try {
    const { countryIso2, stateIso2 } = req.params;
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Country API key not configured" });
    }

    if (!countryIso2 || !stateIso2) {
      return res
        .status(400)
        .json({ message: "Country ISO2 and State ISO2 codes are required" });
    }

    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/${countryIso2}/states/${stateIso2}`,
      {
        headers: {
          "X-CSCAPI-KEY": apiKey,
        },
      }
    );

    const state = response.data;
    res.json({ state });
  } catch (error) {
    console.error("Get state details error:", error);
    if (error.response) {
      res.status(error.response.status).json({
        message: "Failed to fetch state details from external API",
        error: error.response.data,
      });
    } else {
      res
        .status(500)
        .json({ message: "Server error while fetching state details" });
    }
  }
};

module.exports = {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
  getCitiesByCountry,
  getCountryDetails,
  getStateDetails,
};
