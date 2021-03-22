const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
    const $ = cheerio.load(data);
    return $(".col-md-3")
      .map((i, element) => {
        const brand = "Mud Jeans"
        const name = $(element)
          .find('.product-title')
          .text()
          .trim()
          .replace(/\s/g, ' ');
        const price =parseInt(
          $(element)
            .find('.product-price ').first()
            .text()
            .replace(/Buy€/g, '')
            .replace(/\n/g,'')
      );
  
        return {brand,name, price};
      })
      .get();
  };



 /**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
    const response = await axios(url);
    const {data, status} = response;
  
    if (status >= 200 && status < 300) {
      return parse(data);
    }
    
  console.error(status);

  return null;
};