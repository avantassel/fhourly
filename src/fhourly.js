const vow = require('vow');
const prompt = require('prompt');
const chalk = require('chalk');
const numeral = require('numeral');
const moment = require('moment');

function Fhourly() { };

Fhourly.prototype.run = function(){

  var totalBeerPackagedInGallons = 0;
  var hourlyPrice = 0;
  var pintIngredientCost = 0.43;
  const hoursPerBatch = 42;
  const hoursPerDryHop = 1;
  
  function calcBeerGallons(result) {
    var total = 0;
  if (result.halfBarrelKegs) {
    total = result.halfBarrelKegs * 15.5;
  }
    if (result.sixtelKegs) {
      total += result.sixtelKegs * 5.2;
    }
    return total;
  }
  
  function calcHourlyPrice(result) { 
    var gallons = calcBeerGallons(result);
    var pints = gallons * 8; // 8 pints in a gallon
    var totalPrice = pints * result.pricePerPint;
    var hours = result.totalBatches * hoursPerBatch;
    hours += result.totalDryHops * hoursPerDryHop;
    
    return totalPrice / hours;
  }
  
  function calcIngredientCost(result) { 
    if (result.totalDryHops) {
      pintIngredientCost = 0.97; // hazy price
    }
    return pintIngredientCost;
  }
  
function validateResults(result){
    var valid = true;
    if (isNaN(result.halfBarrelKegs)) {
      console.log(
      `
      ${chalk.bold.red('Half Barrel Kegs "'+result.halfBarrelKegs+'" is not a number')}
      `);
      valid = false;
    }
    if(isNaN(result.sixtelKegs)){
      console.log(
      `
      ${chalk.bold.red('Sixtel Kegs "'+result.sixtelKegs+'" is not a number')}
      `);
      valid = false;
    }
    if(isNaN(result.pricePerPint)){
      console.log(
      `
      ${chalk.bold.red('Pint Price (16oz) "'+result.pricePerPint+'" is not a number')}
      `);
      valid = false;
    }
    if(isNaN(result.totalBatches)){
      console.log(
      `
      ${chalk.bold.red('Batches "'+result.totalBatches+'" is not a number')}
      `);
      valid = false;
    }
    if(isNaN(result.totalDryHops)){
      console.log(
      `
      ${chalk.bold.red('Dry Hops "'+result.totalDryHops+'" is not a number')}
      `);
      valid = false;
    }
    return valid;
  }

    prompt.start();

    var prompts = [
      { name: 'halfBarrelKegs', message: 'Enter the number of 1/2 barrel kegs:', default: 14 },
      { name: 'sixtelKegs', message: 'Enter the number of sixtel kegs:', default: 0 },
      { name: 'brewerCount', message: 'Enter the number of brewers:', default: 1 },
      { name: 'pricePerPint', message: 'Enter the price per pint you charge:', default: 1.00 },
      { name: 'totalBatches', message: 'Enter the total number of batches:', default: 1 },
      { name: 'totalDryHops', message: 'Enter the total number of dry hops:', default: 0 }
    ];
    
  prompt.get(prompts, function (err, result) {

    if (!validateResults(result)) {
      return false;
    }
    
    calcIngredientCost(result);
    
    // ensure number
    result.halfBarrelKegs = +result.halfBarrelKegs;
    result.sixtelKegs = +result.sixtelKegs;
    result.pintPrice = +result.pintPrice;
    result.totalBatches = +result.totalBatches;
    result.totalDryHops = +result.totalDryHops;
      
    totalBeerPackagedInGallons = calcBeerGallons(result);
      
    if (totalBeerPackagedInGallons <= 0) {
      console.log(
        `
        ${chalk.red('Enter an amount packaged')}
      `);
      return false;
    }
      
    hourlyPrice = calcHourlyPrice(result);
    console.log(
    `
    ${chalk.cyan('Total Barrels ' + numeral(totalBeerPackagedInGallons/31).format('0,0.00'))}
    ${chalk.cyan('Total Gallons ' + numeral(totalBeerPackagedInGallons).format('0,0.00'))}
    ${chalk.cyan('Total Pints (16oz) ' + numeral(totalBeerPackagedInGallons * 8).format('0,0.00'))}
    
    ${chalk.yellow('Batch Ingredient Cost $' + numeral((totalBeerPackagedInGallons * 8)*pintIngredientCost).format('0,0.00'))}
    
    ${chalk.bgGreen.bold('You will make $' + numeral(hourlyPrice/result.brewerCount).format('0,0.00') + ' per brewer hourly')} 
    `);
  });
};

module.exports = Fhourly;