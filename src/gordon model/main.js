import { amountConfig, generateSharableLink, numberWithCommas, parseFromUrl } from "../utils/utils.js";

/*------------------------------------- GORDON MODEL ------------------------------------------------ */
const noi = new AutoNumeric('#noi', amountConfig);
const discountRate = document.getElementById('discount-rate');
const noiGrowthRate = document.getElementById('noi-growth-rate');
const gordonModelCapRate = document.getElementById('gm-cap-rate');
const gordonModelValue = document.getElementById('gm-value');
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

const calculateGordonModelCapRate = () => {
  const noiValue = parseFloat(noi.rawValue);
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

  shareLink.value = generateSharableLink(url, [noi, discountRate, noiGrowthRate]);
}

noi.domElement.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
discountRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
noiGrowthRate.addEventListener('input', (e) => { calculateGordonModelCapRate(); });
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [noi, discountRate, noiGrowthRate]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});

parseFromUrl(window.location.href, [calculateGordonModelCapRate]);