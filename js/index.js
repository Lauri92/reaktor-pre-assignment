'use strict';

const itemContainer = document.querySelector('#item-container');
const chosenCategory = document.querySelector('#chosen-category');

// URL
const allproductsUrl = 'https://tranquil-falls-40857.herokuapp.com/products/allproducts';
//const allproductsUrl = 'http://localhost:5000/products/allproducts';
const productCategory = 'https://tranquil-falls-40857.herokuapp.com/products/specific/';
//const productCategory = 'http://localhost:5000/products/specific/';

// Buttons
const glovesButton = document.querySelector('#gloves-button');
glovesButton.param = 'gloves';
const facemasksButton = document.querySelector('#facemasks-button');
facemasksButton.param = 'facemasks';
const beaniesButton = document.querySelector('#beanies-button');
beaniesButton.param = 'beanies';

// For tracking AJAX call and not have multiple calls happening at the same time (user clicks button too frequently)
let isLoading = false;

// Get information of a category of items
const showProduct = async (e) => {
  if (isLoading === false) {
    isLoading = true;
    itemContainer.innerHTML = '';

    let category = e.currentTarget.param;
    let allOfCategory;
    let categoryResponse;

    // Check which button was pressed
    switch (category) {
      case 'gloves':
        allOfCategory = await fetch(productCategory + 'gloves');
        categoryResponse = await allOfCategory.json();
        console.log(categoryResponse);
        break;
      case 'facemasks':
        allOfCategory = await fetch(productCategory + 'facemasks');
        categoryResponse = await allOfCategory.json();
        console.log(categoryResponse);
        break;
      case 'beanies':
        allOfCategory = await fetch(productCategory + 'beanies');
        categoryResponse = await allOfCategory.json();
        console.log(categoryResponse);
    }

    // Create a container for manufacturer
    categoryResponse.forEach((item) => {
      const {type, manufacturer, data} = item;

      chosenCategory.innerHTML = type;
      chosenCategory.style.display = 'block';
      const manufacturerNameContainer = document.createElement('h3');
      manufacturerNameContainer.innerHTML = manufacturer;
      const manufacturerContainer = document.createElement('div');
      manufacturerContainer.className = 'manufacturer-container';
      manufacturerContainer.appendChild(manufacturerNameContainer);
      itemContainer.appendChild(manufacturerContainer);

      // Create container for an item
      data.forEach((item) => {
        const {name, price, status} = item;

        const itemInfoP = document.createElement('p');
        itemInfoP.classList.add('item');

        itemInfoP.innerHTML = `${name} <br> ${price}₿ <br> ${status}`;
        manufacturerContainer.appendChild(itemInfoP);
      });
    });
    isLoading = false;
  }
};

glovesButton.addEventListener('click', showProduct);
facemasksButton.addEventListener('click', showProduct);
beaniesButton.addEventListener('click', showProduct);

// Request to check cache status, called when the user loads website
const checkCache = async () => {
  // Initial load on heroku might cause error
  try {
    document.querySelector('#loading-div').style.display = 'block';
    const cache = await fetch(allproductsUrl);
    const cacheResponse = await cache.json();
    console.log(cacheResponse);

    if (cacheResponse.loadStatus === 'ready') {
      itemContainer.innerHTML = '';
      glovesButton.style.display = 'inline-block';
      facemasksButton.style.display = 'inline-block';
      beaniesButton.style.display = 'inline-block';
      chosenCategory.style.display = 'block';
    } else if (cacheResponse.loadStatus === 'still loading') {
      document.querySelector('#loading-div').textContent = 'Still loading'
      // Refresh until there is value
      setTimeout(checkCache, 2000);
    } else {
      // Refresh until there is value
      setTimeout(checkCache, 2000);
    }
  } catch (e) {
    console.error(e);
    setTimeout(checkCache, 2000);
  }
};

checkCache();
