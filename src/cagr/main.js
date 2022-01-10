import { amountConfig, insertErrorMessage, removeErrorMessage, generateSharableLink, parseFromUrl } from "../utils/utils.js";
// input: initial investment, final investment, number of periods
const intialInvestmentValue = new AutoNumeric('#initial-investment-value', amountConfig);
const finalInvestmentValue = new AutoNumeric('#ending-investment-value', amountConfig);
const numberOfPeriods = document.getElementById('number-of-periods');
const termPeriod = document.getElementById('term-period');
// output : CAGR
const resultantCAGR = document.getElementById('cagr');
// Shareable link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
// validate number of periods to stay within the range of 0 to 12000
const validateNumberOfPeriods = (e) => { 
  let value = e.target.value;

  if (value > 12000) {
    e.target.value = 12000;
    insertErrorMessage(e, 'Number of periods cannot be greater than 12000');
  } else {
    removeErrorMessage(e);
  }
}
/* 
  calculate CAGR
  CAGR = (Final Investment / Initial Investment) ^ (1 / Number of Periods) - 1
*/
const calculateCAGR = () => { 
  const initialInvestment = parseInt(intialInvestmentValue.rawValue);
  const finalInvestment = parseInt(finalInvestmentValue.rawValue);
  let numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  numberOfPeriodsValue = termPeriod.checked ? numberOfPeriodsValue : numberOfPeriodsValue * 12;
  const inverseNumberOfPeriodsValue = 1 / numberOfPeriodsValue;

  const cagr = ((finalInvestment / initialInvestment) ** inverseNumberOfPeriodsValue) - 1;

  if (cagr) {
    resultantCAGR.innerText = (cagr * 100).toFixed(2) + '%';
  } else {
    resultantCAGR.innerText = '0.0%';
  }

  shareLink.value = generateSharableLink(url, [intialInvestmentValue, finalInvestmentValue, numberOfPeriods, termPeriod]);
}
// add event listener to inputs
numberOfPeriods.addEventListener('input', validateNumberOfPeriods);

[intialInvestmentValue, finalInvestmentValue, numberOfPeriods, termPeriod].forEach(element => {
  if (element.domElement) {
    element.domElement.addEventListener('input', calculateCAGR);
  } else {
    element.addEventListener('input', calculateCAGR);
  }
});

// Event Listeners for changing Loan Term Period Value
termPeriod.addEventListener('input', () => {
  if (termPeriod.checked) {
    termPeriod.value = 'Monthly';
  } else {
    termPeriod.value = 'Yearly';
  }
});
// Event Listners for generating sharable link and copy link to clipboard
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [intialInvestmentValue, finalInvestmentValue, numberOfPeriods, termPeriod]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// Get parmas from url
const params = new URLSearchParams(url.search);
// Toggle checkbox based on url params
if (params.has('term-period')) {
  let value = params.get('term-period');
  
  if (value === 'Monthly') {
    termPeriod.checked = true;
  } else {
    termPeriod.checked = false;
  }
}
// Populating input fields for sharable link and calculating the result
parseFromUrl(window.location.href, [calculateCAGR]);

