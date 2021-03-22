// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


// current products on the page
let currentProducts = [];
let currentPagination = {};
let brands  = [];

// inititiate selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector('#brand-select');
const selectSort = document.querySelector('#sort-select');
const availableProducts = document.querySelector('#available-prod');
const lastReleased = document.querySelector('#last-released');
const spanp50 = document.querySelector('#p50')
const spanp90 = document.querySelector('#p90')
const spanp95 = document.querySelector('#p95')
const newProd = document.querySelector('#new-prod')
/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};


/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * 
 */
const fetchProducts = async (page = 1, size = 12, ) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};


//Use the APIIIIII
const fetchBrands = async() => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app/brands`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {};
    }

    brands = body.data.result;
    brands.push("all");
  } catch (error) {
    console.error(error);
    return {};
  }
};

const fetchNewProducts = async() => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=1&size=${spanNbProducts.innerHTML}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    
    var nbNew = body.data.result.filter(a => ((Date.now() - Date.parse(a.released))/86400000)/7 < 14).length;
    return nbNew;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  if(selectBrand.value != "all"){
    products = products.filter(prod => prod.brand == selectBrand.value);
  }

  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

/**
 * Render list of brands
 * 
 */
const renderBrands = () => {
  const options = Array.from(
    {'length': brands.length},
    (value, index) => <option value="${brands[index]}">${brands[index]}</option>
  ).join('');
  selectBrand.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  
  const options = Array.from(
    {'length': pageCount},
    (value, index) => <option value="${index + 1}">${index + 1}</option>
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

function sortProductsDate(products,sort_type){
  return products.sort(function(a,b){
    if (Date.parse(a.released) < Date.parse(b.released)){
      if(sort_type == "date-asc"){
        return 1;
      }
      return -1;
    }
      
    if (Date.parse(a.released) > Date.parse(b.released)){
      if(sort_type == "date-asc"){
        return -1;
      }
      return 1;
    }
      
    return 0;

  });
};

function selectResonablePrice(products){
  return products.filter(a => a.price <=50);
};


function sortProducts(products,sort_type){
  if(["date-asc","date-desc"].includes(sort_type)){
    return sortProductsDate(products,sort_type);
  }
  else if(sort_type == "reasonable"){
    return selectResonablePrice(products);
  }
  return products;
};


/**
 * Render page selector
 * @param  {Object} pagination
 * @param  {Array} products
 */
const renderIndicators = (pagination,products) => {
  const {count} = pagination;
  availableProducts.innerHTML = sectionProducts.getElementsByTagName('div').length-1;
  spanNbProducts.innerHTML = count;
  lastReleased.innerHTML = "";
  console.log(currentProducts);
  currentProducts.forEach(element => {
    
    if(lastReleased.innerHTML == ""){
      lastReleased.innerHTML = element.released;
    }
    else if(Date.parse(element.released) > Date.parse(lastReleased.innerHTML) ){
      lastReleased.innerHTML = element.released;
    }
  });
  
  //spanp50.innerHTML = 
  
  var prods = Array.prototype.slice.call(sectionProducts.getElementsByTagName('div'));  
  
  prods = prods.sort( function(a,b){
    if (Number(a.lastElementChild.innerHTML) < (Number(b.lastElementChild.innerHTML))){
      
      return -1;
    }
      
    if (Number(a.lastElementChild.innerHTML) > (Number(b.lastElementChild.innerHTML))){
      
      return 1;
    }
      
    return 0;
  });
  //console.log(prods);
  console.log(prods[1]);
  fetchNewProducts().then(result =>newProd.innerHTML =result );
  spanp50.innerHTML = prods[parseInt(prods.length/2+1)].lastElementChild.innerHTML;
  spanp90.innerHTML = prods[parseInt(prods.length*0.90+1)].lastElementChild.innerHTML;
  spanp95.innerHTML = prods[parseInt(prods.length*0.95+1)].lastElementChild.innerHTML;
  
  //spanp50.innerHTML = spanp50.innerHTML/(prods.length-1))
};


const render = (products, pagination, brandlist = false) => {
  if(brandlist){
    renderBrands(brands)
    selectBrand.value = "all";
  }
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination,products);
  
  
  
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */

selectShow.addEventListener('change', event => {
  fetchProducts(1, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(sortProducts(currentProducts,selectSort.value), currentPagination));
});

selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value),selectShow.value)
    .then(setCurrentProducts)
    .then(() => render(sortProducts(currentProducts,selectSort.value), currentPagination));
});

selectBrand.addEventListener('change', event =>{
  fetchProducts(selectPage.value,selectShow.value)
    .then(setCurrentProducts)
    .then(() => render(sortProducts(currentProducts,event.target.value), currentPagination,false));
  
});


selectSort.addEventListener('change',event =>{
  render(sortProducts(currentProducts, event.target.value),currentPagination);
  
});

document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(brands = fetchBrands)
        .then(() => render(currentProducts, currentPagination,true))
);