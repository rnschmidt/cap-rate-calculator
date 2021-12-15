import { numberWithCommas } from "../utils/utils.js";

/*------------------------------------- GORDON MODEL ------------------------------------------------ */
const noi = document.getElementById('noi');
const discountRate = document.getElementById('discount-rate');
const noiGrowthRate = document.getElementById('noi-growth-rate');
const gordonModelCapRate = document.getElementById('gm-cap-rate');
const gordonModelValue = document.getElementById('gm-value');

const calculateGordonModelCapRate = () => {
  const noiValue = parseFloat(noi.value);
  const discountRateValue = parseFloat(discountRate.value);
  const noiGrowthRateValue = parseFloat(noiGrowthRate.value);
  let capRate = 0;
  
  if (discountRateValue) {
    capRate = discountRateValue;
  }

  if (noiGrowthRateValue) {
    capRate -= noiGrowthRateValue;
  }
  
  gordonModelCapRate.innerText = capRate.toFixed(2) + '%';

  if (noiValue && capRate) {
    let value = (noiValue * (100 / capRate)).toFixed(2);
    gordonModelValue.innerText = '$' + numberWithCommas(value);
  }
}

noi.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
discountRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
noiGrowthRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });