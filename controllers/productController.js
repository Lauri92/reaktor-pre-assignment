'use strict';

// Promise based HTTP client for the browser and node.js
const axios = require('axios');

// A simple caching module that has set, get and delete methods
const NodeCache = require('node-cache');
const itemCache = new NodeCache();

// For tracking if cache update is in progress
let isLoading = false;

// Function is ran when user reloads page. Also called frequently in backend to see if cache needs updating
const get_all_product_info = async (req, res) => {

  // Get value from cache
  const checkKey = itemCache.get('glovesKey');
  const timestamp = itemCache.getTtl('glovesKey');
  const date = Date.now();
  const remainingTime = timestamp - date;

  // If there is no value for cached items, or time which cached items stay in cache is too low
  // and another cache load request isn't pending
  if ((checkKey === undefined || remainingTime < 5 * 60 * 1000) && isLoading ===
      false) {

    isLoading = true;
    console.log('Updating cache');

    const getManufacturers = await axios.get(
        'http://bad-api-assignment.reaktor.com/v2/products/gloves');
    const facemasks = await axios.get(
        'http://bad-api-assignment.reaktor.com/v2/products/facemasks');
    const beanies = await axios.get(
        'http://bad-api-assignment.reaktor.com/v2/products/beanies');
    const glovesData = getManufacturers.data;
    const facemasksData = facemasks.data;
    const beaniesData = beanies.data;

    // Create an array to contain all products
    const allProducts = [];
    allProducts.push(glovesData, facemasksData, beaniesData);

    // Get unique manufacturers, these actually change daily...
    const manufacturers = [
      ...new Set(
          glovesData.map(manufacturer => manufacturer.manufacturer))];

    console.log(manufacturers);

    // Get all products...
    allAvailabilities(manufacturers, allProducts).then((response) => {
      // Returned value includes all manufacturers and separated arrays for each
      // manufacturers gloves, facemasks and beanies
      // Gloves are the first element..
      const gloves = response.map((item) => {
        return item[0];
      });
      const facemasks = response.map((item) => {
        return item[1];
      });
      const beanies = response.map((item) => {
        return item[2];
      });

      // ...then set data to cache. These values live for 20 minutes and will be returned for requests
      itemCache.mset([
        {key: 'glovesKey', val: gloves, ttl: 20 * 60},
        {key: 'facemasksKey', val: facemasks, ttl: 20 * 60},
        {key: 'beaniesKey', val: beanies, ttl: 20 * 60},
      ]);
      console.log('objects set');

      if (req !== undefined) {
        // Function was called by HTTP request so send a status message of cache
        res.json({loadStatus: 'ready'});
      }

      // Set loading to be complete
      isLoading = false;
    });
  } else if (isLoading === true) {
    if (req !== undefined) {
      // Function was called by HTTP request so send a status message of cache
      // loading hasn't finished yet
      res.json({loadStatus: 'still loading'});
    }
  } else {
    if (req !== undefined) {
      // Function was called by HTTP request
      // there is data in cache
      res.json({loadStatus: 'ready'});
    }
    console.log('Cache is up to date');
  }
};

// Function that calls to gather data for each manufacturer
const allAvailabilities = async (manufacturers, allProducts) => {
  let manufacturerProducts = [];

  manufacturers.forEach((manufacturer) => {
    manufacturerProducts.push(getAvailabilitiesByManufacturer(
        manufacturer, allProducts));
  });

  return Promise.all(manufacturerProducts);
};

// Function that gathers data for each manufacturer
const getAvailabilitiesByManufacturer = async (manufacturer, allProducts) => {

  let manufacturerAvailability;

  // Request until actual data is sent from the API
  do {
    manufacturerAvailability = await axios.get(
        `http://bad-api-assignment.reaktor.com/v2/availability/${manufacturer}`);
  } while (manufacturerAvailability.data.response.length <= 2);

  console.log(`Fetched ${manufacturer} data`);

  let availabilities = manufacturerAvailability.data.response;
  const manufacturerItems = [];

  // Iterate for each category for a brand
  allProducts.forEach((item) => {
    const productItems = [];

    // Each item in a category
    item.forEach((product) => {
      const {name, price} = product;

      // Find matching id for the currently iterated item from the array containing all availabilities
      let availability = availabilities.find(
          item => item.id.toLowerCase() === product.id.toLowerCase());

      // Availabilities also contains ids which are not reference to any item
      if (availability !== undefined) {
        // Regex to extrat the stock value
        const status = availability.DATAPAYLOAD.match(
            /<INSTOCKVALUE>(.*?)<\/INSTOCKVALUE>/g).map((value) => {
          return value.replace(/<\/?INSTOCKVALUE>/g, '');
        });

        // Collect relevant data of the item into an object
        const filteredItem = {
          name: name,
          price: price,
          status: status[0],
        };
        // Push to an array containing gloves, facemasks or beanies of a manufacturer
        productItems.push(filteredItem);
      }
    });
    // Push to an array containing all 3 categories of manufacturer
    manufacturerItems.push(productItems);
  });

  return [
    {
      type: 'gloves',
      manufacturer: manufacturer,
      data: manufacturerItems[0],
    }, {
      type: 'facemasks',
      manufacturer: manufacturer,
      data: manufacturerItems[1],
    }, {
      type: 'beanies',
      manufacturer: manufacturer,
      data: manufacturerItems[2],
    }];
};

// Return data of requested category
const get_product_category = async (req, res) => {
  const category = req.params.category;
  const product = itemCache.get(category + 'Key');
  res.json(product);
};

// How often the cache is checked if it has up to date info
setInterval(get_all_product_info, 2 * 60 * 1000);

module.exports = {
  get_all_product_info,
  get_product_category,
};