// Dynamic MIRR Calculator

import { insertErrorMessage, removeErrorMessage, insertWarningMessage, removeWarningMessage,numberWithCommas, generateSharableLink, renderCopyDownIcon, IRR, MIRR } from "../utils/utils.js";
// input fields
const financeRate = document.getElementById('finance-rate');
const reinvestmentRate = document.getElementById('reinvestment-rate');
const numberOfPeriods = document.getElementById('number-of-periods');
// containers for input and output
const cashFlowContainer = document.querySelector('.cash-flow-container');
const resultantCashFlowContainer = document.querySelector('.resultant-cash-flow-container');
// output
const resultantFinanceRate = document.getElementById('resultant-finance-rate');
const resultantReinvestmentRate = document.getElementById('resultant-reinvestment-rate');
const resultantNumberOfPeriods = document.getElementById('resultant-number-of-periods');
const resultantIRR = document.getElementById('irr');
const resultantMIRR = document.getElementById('mirr');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

let cashFlows = new Array(21).fill(0);

let elements = [];
// validate number of periods with proper error message
const validateNumberOfPeriods = (e) => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);

  if (numberOfPeriodsValue < 1) { 
    insertErrorMessage(e, 'Number of periods must be greater than 0');
  }

  if (numberOfPeriodsValue > 20) {
    numberOfPeriods.value = 20;
    insertErrorMessage(e, 'Number of periods cannot be greater than 20');
  }

  if (numberOfPeriodsValue >= 1 && numberOfPeriodsValue <= 20) { 
    removeErrorMessage(e);
  }
}
// update Number of Periods on calculated result side
const updateResultantNumberOfPeriods = (numberOfPeriodsValue) => { 
  if (numberOfPeriodsValue) {
    resultantNumberOfPeriods.innerText = numberOfPeriodsValue;
  } else {
    resultantNumberOfPeriods.innerText = 1;
  }
}

const getSuperScript = (number) => { 
  switch (number) { 
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
// update cash flow array on input change with given index and value
const updateCashFlow = (id, value) => cashFlows[id] = value;
// clear cash flows array on change of number of periods
const clearCashFlows = () => {
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  for (let i = numberOfPeriodsValue + 1; i < cashFlows.length; i++) {
    cashFlows[i] = 0;
  }
}
// update cash flow on resultant side with given index and value
const updateResultantCashFlow = (number, value) => {
  const id = `resultant-${number}${getSuperScript(number)}-year`;
  const amount = document.getElementById(id);
  amount.innerText = cashFlows[number] >= 0 ? '$' + value : '-$' + value.replace('-', '');
}
// insert input field along with label to cash flow container and add event listener to input field
const getCashFlowInput = (number, value) => { 
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('input-container');
  const inputLabel = document.createElement('div');
  inputLabel.classList.add('input-label');
  const label = document.createElement('label');
  const year = document.createElement('span');
  // year.innerText = 'Year ';
  label.appendChild(year);
  const numberText = document.createElement('span');
  numberText.innerText = number;
  label.appendChild(numberText);
  inputLabel.appendChild(label);
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('input-wrapper');
  let dollar = document.createElement('span');
  dollar.classList.add('dollar-sign');
  dollar.innerText = '$';
  inputWrapper.appendChild(dollar);
  const input = document.createElement('input');
  input.classList.add('dollar');
  input.classList.add('validate-amount');
  input.id = `${number}${getSuperScript(number)}-year`;
  input.type = 'text';
  input.name = input.id;
  input.value = value;
  let autoInput = new AutoNumeric(input, {
    decimalPlaces: 0,
    decimalPlacesRawValue: 0,
    minimumValue: "-100000000000000",
    maximumValue: "100000000000000",
    modifyValueOnWheel: false
  });
  elements.push(autoInput);
  input.addEventListener('input', () => {
    updateCashFlow(number, parseInt(autoInput.rawValue) || 0);
    updateResultantCashFlow(number, autoInput.domElement.value);
    calculateIRR();
    calculateMIRR();
  });
  inputWrapper.appendChild(input);
  inputContainer.appendChild(inputLabel);
  inputContainer.appendChild(inputWrapper);
  const copyDownIcon = renderCopyDownIcon(inputContainer);
  copyDownIcon.addEventListener('click', () => { 
    for (let index = number; index <= numberOfPeriods.value; index++) {
      let element = document.getElementById(`${index}${getSuperScript(index)}-year`);
      AutoNumeric.set(element, autoInput.rawValue);
      updateCashFlow(index, parseInt(autoInput.rawValue) || 0);
      updateResultantCashFlow(index, autoInput.domElement.value);
      calculateIRR();
      calculateMIRR();
    } 
  });
  return inputContainer;
}
// insert new row to resultant cash flow container
const getCashFlowOutput = (number, value) => { 
  const row = document.createElement('div');
  row.classList.add('row');
  const yearText = document.createElement('h4');
  yearText.innerText = number;
  const amountText = document.createElement('h4');
  amountText.innerText = value >= 0 ? '$' + numberWithCommas(value) : '-$' + numberWithCommas(Math.abs(value));
  amountText.id = `resultant-${number}${getSuperScript(number)}-year`;
  row.appendChild(yearText);
  row.appendChild(amountText);
  return row;
}
// remove all inputs from cash flow container and all rows from resultant cash flow container
const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
/*
  Updating cash flow container involve follwing steps:
  1. Remove all inputs from cash flow container
  2. Remove all rows from resultant cash flow container
  3. Insert new inputs and rows to cash flow container
  4. Update cash flow array on input change with given index and value
  5. Update resultant cash flow on input change with given index and value
  6. Calculate IRR, MIRR and NPV
*/
const updateCashFlowContainer = () => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);

  elements = [];
  removeAllChildNodes(cashFlowContainer);
  removeAllChildNodes(resultantCashFlowContainer);
  clearCashFlows();
  
  for (let i = 0; i <= numberOfPeriodsValue; i++) {
    cashFlowContainer.appendChild(getCashFlowInput(i, cashFlows[i]));
    resultantCashFlowContainer.appendChild(getCashFlowOutput(i, cashFlows[i]));
  }
  
  calculateIRR();
  calculateMIRR();
}
// calculate IRR on input change whose helper function is present in utils.js
const calculateIRR = () => {
  let n = parseInt(numberOfPeriods.value) + 1;
  let irr = IRR(cashFlows.slice(0, n));
  irr = (irr * 100).toFixed(2);
  
  if (irr !== 'NaN') {
    resultantIRR.innerText = irr + '%';
  } else {
    resultantIRR.innerText = '0.0%';
  }

  shareLink.value = generateSharableLink(url, [numberOfPeriods, financeRate, reinvestmentRate, ...elements]);
}
// calculate MIRR on input change whose helper function is present in utils.js
const calculateMIRR = () => { 
  let n = parseInt(numberOfPeriods.value) + 1;
  let financeRateValue = parseFloat(financeRate.value) / 100;
  let reinvestmentRateValue = parseFloat(reinvestmentRate.value) / 100;
  
  if (financeRateValue) {
    resultantFinanceRate.innerText = financeRateValue * 100 + '%';
    removeWarningMessage(financeRate);
  } else {
    resultantFinanceRate.innerText = '0.0%';
    insertWarningMessage(financeRate, 'Finance rate is required to calculate MIRR');
  }

  if (reinvestmentRateValue) {
    resultantReinvestmentRate.innerText = reinvestmentRateValue * 100 + '%';
    removeWarningMessage(reinvestmentRate);
  } else {
    resultantReinvestmentRate.innerText = '0.0%';
    insertWarningMessage(reinvestmentRate, 'Reinvestment rate is required to calculate MIRR');
  }

  let mirr = MIRR(cashFlows.slice(0, n), financeRateValue, reinvestmentRateValue);
  mirr = (mirr * 100).toFixed(2);
  
  if (mirr !== 'NaN') {
    resultantMIRR.innerText = mirr + '%';
  } else {
    resultantMIRR.innerText = '0.0%';
  }

  shareLink.value = generateSharableLink(url, [numberOfPeriods, financeRate, reinvestmentRate, ...elements]);
}

[financeRate, reinvestmentRate].forEach(element => element.addEventListener('input', calculateMIRR));
// event listener for number of periods input
numberOfPeriods.addEventListener('input', (e) => {
  validateNumberOfPeriods(e);
  updateResultantNumberOfPeriods(e.target.value);
  updateCashFlowContainer();
});
// on click of share result button generate new sharable link 
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [numberOfPeriods, financeRate, reinvestmentRate, ...elements]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// Form here is used to pre-populate the form with the values from the sharable link url parameters
const params = new URLSearchParams(url.search);
const numberOfPeriodsValue = params.get('number-of-periods');
const financeRateValue = params.get('finance-rate');
const reinvestmentRateValue = params.get('reinvestment-rate');

numberOfPeriods.value = numberOfPeriodsValue || 5;
updateResultantNumberOfPeriods(numberOfPeriodsValue || 5);

if (financeRateValue) { 
  financeRate.value = financeRateValue;
  resultantFinanceRate.innerText = financeRateValue + '%';
}
if (reinvestmentRateValue) { 
  reinvestmentRate.value = reinvestmentRateValue;
  resultantReinvestmentRate.innerText = reinvestmentRateValue + '%';
}

for (let period = 0; period <= numberOfPeriodsValue; period++) {
  let id = `${period}${getSuperScript(period)}-year`;
 
  if (params.has(id)) {
    const value = params.get(id);
    cashFlows[period] = parseInt(value.replace(/\$|,/g, ''));
  }
}

updateCashFlowContainer();