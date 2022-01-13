import { amountConfig, numberWithCommas, generateSharableLink, parseFromUrl } from "../utils/utils.js";
// input selectors
const calculate = document.getElementById('calculate');
const numberOfYearsLabel = document.getElementById('noyl');
const numberOfYears = document.getElementById('number-of-years');
const interestRateLabel = document.getElementById('inrl');
const interestRate = document.getElementById('interest-rate');
const yearSymbol = document.getElementById('yr-symbol');
const percentSymbol = document.getElementById('percent-symbol');
const amount = new AutoNumeric('#amount', amountConfig);
const intermediateResultLeft = document.getElementById('intermediate-result-left');
const intermediateResultRight = document.getElementById('intermediate-result-right');
const cardResultInnerContainer = document.querySelector('.card-result-inner-container');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
// show/hide input filed based on dropdown selection
const updateDOM = (e) => {
  const value = e ? e.target.value : calculate.value;
  
  if (value === 'Interest Rate') {
    intermediateResultLeft.innerText = 'Interest Rate';
    intermediateResultRight.innerText = '0.0%';
    interestRateLabel.classList.add('hide');
    interestRate.classList.add('hide');
    percentSymbol.classList.add('hide');
    numberOfYearsLabel.classList.remove('hide');
    numberOfYears.classList.remove('hide');
    yearSymbol.classList.remove('hide');
  } else {
    numberOfYearsLabel.classList.add('hide');
    numberOfYears.classList.add('hide');
    yearSymbol.classList.add('hide');
    interestRateLabel.classList.remove('hide');
    interestRate.classList.remove('hide');
    percentSymbol.classList.remove('hide');
    intermediateResultLeft.innerText = 'Number of Years';
    intermediateResultRight.innerText = '0';
  }

  calculateRuleOf72();
};
// calculate rule of 72 on change of input
const calculateRuleOf72 = () => { 
  cardResultInnerContainer.innerHTML = '';

  const numberOfYearsValue = numberOfYears.value;
  const interestRateValue = interestRate.value;
  const amountValue = amount.rawValue;
  const dropdownValue = calculate.value;
  
  let result = 0;
  let symbol = '';
  let n = numberOfYearsValue || 0;
  let intr = interestRateValue;

  if (dropdownValue === 'Interest Rate') { 
    result = 72 / numberOfYearsValue;
    symbol = '%';
    intr = result.toFixed(2)
  } else {
    result = 72 / interestRateValue;
    symbol = 'yrs';
    n = Number.isFinite(result) ? Math.round(result) : 0;
  }

  if (result && Number.isFinite(result)) { 
    intermediateResultRight.innerText = `${result.toFixed(2)} ${symbol}`;
  } else {
    intermediateResultRight.innerText = '0 ' + symbol;
  }

  let eoy = amountValue;
  
  for (let i = 1; i <= n; i++) {
    let row = document.createElement('div');
    row.classList.add('row');
    eoy = Math.round(eoy * (1 + intr / 100));
    row.innerHTML = `
      <h4>${i}</h4>
      <h4>${intr}%</h4>
      <h4>${numberWithCommas(eoy)}</h4>
    `
    cardResultInnerContainer.appendChild(row);
  }

  shareLink.value = generateSharableLink(url, [calculate, numberOfYears, interestRate, amount]);
}
// add event listener to drown down menu to update DOM
calculate.addEventListener('change', updateDOM);
// add event listener to input fields to calculate rule of 72
[numberOfYears, interestRate, amount.domElement].forEach((element) => element.addEventListener('input', calculateRuleOf72));
// add event listner for share result button to generate new sharable link
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [calculate, numberOfYears, interestRate, amount]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// parse values from url and call the updateDOM function and calculateRuleOf72 function
parseFromUrl(url, [updateDOM, calculateRuleOf72]);