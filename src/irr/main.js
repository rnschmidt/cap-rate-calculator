// Dynamic IRR Calculator

import { IRR, insertErrorMessage, removeErrorMessage, numberWithCommas, generateSharableLink, renderCopyDownIcon } from "../utils/utils.js";

const numberOfPeriods = document.getElementById('number-of-periods');

const cashFlowContainer = document.querySelector('.cash-flow-container');
const resultantCashFlowContainer = document.querySelector('.resultant-cash-flow-container');

const resultantNumberOfPeriods = document.getElementById('resultant-number-of-periods');
const resultantIRR = document.getElementById('irr');
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

let cashFlows = new Array(21).fill(0);

let elements = [];
// Validate Number of Periods input with proper error message
const validateNumberOfPeriods = (e) => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);

  if (numberOfPeriodsValue < 1) { 
    numberOfPeriods.value = 1;
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
// update Number of Periods on Calculated Result Container
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
// updated cash flow array to reflect the new input
const updateCashFlow = (id, value) => cashFlows[id] = value;
// clear cash flow on change of number of periods
const clearCashFlows = () => {
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  for (let i = numberOfPeriodsValue + 1; i < cashFlows.length; i++) {
    cashFlows[i] = 0;
  }
}
// update cash flow on resultant container where row number is equal to `number` argument
const updateResultantCashFlow = (number, value) => {
  const id = `resultant-${number}${getSuperScript(number)}-year`;
  const amount = document.getElementById(id);
  amount.innerText = cashFlows[number] >= 0 ? '$' + value : '-$' + value.replace('-', '');
}
// insert new set of input along with label and event listner for cash flow on change of nubmer of periods
const getCashFlowInput = (number, value) => { 
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('input-container');
  const inputLabel = document.createElement('div');
  inputLabel.classList.add('input-label');
  const label = document.createElement('label');
  const year = document.createElement('span');
  year.innerText = 'Year ';
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
    } 
  });
  return inputContainer;
}
// insert new row of cash flow on resultant container on change of number of periods
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
// On change of number of periods, clear cash flow and insert new set of input
const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
/*
  Steps follwed on change of number of periods:
  1. Clear cash flow (remove all chlid nodes on cash flow container)
  2. Clear cash flow on resultant container (remove all chlid nodes on resultant cash flow container)
  3. Clear the cash flow array
  4. Insert new set of input along with label and event listner for cash flow
  5. Insert new row of cash flow on resultant container
  6. Calculate IRR
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
}
/* 
  Calaulate IRR (helper function is present in utils.js)
  Generate new sharable link for new sets of inputs
  */
const calculateIRR = () => {
  let n = parseInt(numberOfPeriods.value) + 1;
  let irr = IRR(cashFlows.slice(0, n));
  irr = (irr * 100).toFixed(2);
  
  if (irr !== 'NaN') {
    resultantIRR.innerText = irr + '%';
  } else {
    resultantIRR.innerText = '0.0%';
  }

  shareLink.value = generateSharableLink(url, [numberOfPeriods, ...elements]);
}
// add event listner for number of periods 
numberOfPeriods.addEventListener('input', (e) => {
  validateNumberOfPeriods(e);
  updateResultantNumberOfPeriods(e.target.value);
  updateCashFlowContainer();
});
// add event listner for share result button to generate new sharable link
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [numberOfPeriods, ...elements]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// Following code below is responsible to populate the page with values from url parameters 
const params = new URLSearchParams(url.search);
const numberOfPeriodsValue = params.get('number-of-periods');
// default value for number of periods is 5
numberOfPeriods.value = numberOfPeriodsValue || 5;
updateResultantNumberOfPeriods(numberOfPeriodsValue || 5);
/*
  Check if parameter is present in url for cash flow values. 
  If yes, populate the page with values
*/
for (let period = 0; period <= numberOfPeriodsValue; period++) {
  let id = `${period}${getSuperScript(period)}-year`;
 
  if (params.has(id)) {
    const value = params.get(id);
    cashFlows[period] = parseInt(value.replace(/\$|,/g, ''));
  }
}

updateCashFlowContainer();