// Dynamic IRR Calculator

import { insertWarningMessage, removeWarningMessage, insertErrorMessage, removeErrorMessage, numberWithCommas, generateSharableLink, renderCopyDownIcon, IRR, NPV } from "../utils/utils.js";

const interestRate = document.getElementById('interest-rate');
const numberOfPeriods = document.getElementById('number-of-periods');

const cashFlowContainer = document.querySelector('.cash-flow-container');
const resultantCashFlowContainer = document.querySelector('.resultant-cash-flow-container');

const resultantInterestRate = document.getElementById('resultant-interest-rate');
const resultantNumberOfPeriods = document.getElementById('resultant-number-of-periods');
const resultantIRR = document.getElementById('irr');
const resultantPV = document.getElementById('resultant-pv');
const resultantNPV = document.getElementById('resultant-npv');
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

let cashFlows = new Array(21).fill(0);

let elements = [];

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

const updateCashFlow = (id, value) => cashFlows[id] = value;

const clearCashFlows = () => {
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  for (let i = numberOfPeriodsValue + 1; i < cashFlows.length; i++) {
    cashFlows[i] = 0;
  }
}

const updateResultantCashFlow = (number, value) => {
  const id = `resultant-${number}${getSuperScript(number)}-year`;
  const amount = document.getElementById(id);
  amount.innerText = cashFlows[number] >= 0 ? '$' + value : '-$' + value.replace('-', '');
}

const getCashFlowInput = (number, value) => { 
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('input-container');
  const inputLabel = document.createElement('div');
  inputLabel.classList.add('input-label');
  const label = document.createElement('label');
  const year = document.createElement('span');
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
    calculateNPV();
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
      calculateNPV();
    } 
  });
  return inputContainer;
}

const getCashFlowOutput = (number, value) => { 
  const row = document.createElement('div');
  row.classList.add('row');
  const yearText = document.createElement('h4');
  yearText.innerText = number;
  const amountText = document.createElement('h4');
  amountText.innerText = numberWithCommas(value);
  amountText.id = `resultant-${number}${getSuperScript(number)}-year`;
  row.appendChild(yearText);
  row.appendChild(amountText);
  return row;
}

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

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
  calculateNPV();
}

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

const calculateNPV = () => { 
  const numberOfPeriodsValue = parseInt(numberOfPeriods.value);
  const interestRateValue = parseFloat(interestRate.value);
  
  if (numberOfPeriodsValue) {
    resultantNumberOfPeriods.innerText = numberOfPeriodsValue;
  } else {
    resultantNumberOfPeriods.innerText = 1;
  }

  if (interestRateValue) { 
    resultantInterestRate.innerText = interestRateValue + '%';
    removeWarningMessage(interestRate);
  } else {
    resultantInterestRate.innerText = '0.0%';
    insertWarningMessage(interestRate, 'Discount Rate is required to calculate NPV & PV'); 
  }

  let pv = NPV(cashFlows.slice(0, numberOfPeriodsValue + 1), interestRateValue / 100);
  pv = Math.round(pv);
  
  if (pv) {
    let npv = cashFlows[0] + pv;
    resultantPV.innerText = numberWithCommas(pv);
    resultantNPV.innerText = numberWithCommas(npv);
  } else {
    resultantPV.innerText = '$0';
    resultantNPV.innerText = '$0';
  }

  shareLink.value = generateSharableLink(url, [numberOfPeriods, interestRate, ...elements]);
}

interestRate.addEventListener('input', calculateNPV);

numberOfPeriods.addEventListener('input', (e) => {
  validateNumberOfPeriods(e);
  updateResultantNumberOfPeriods(e.target.value);
  updateCashFlowContainer();
});

shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [numberOfPeriods, interestRate, ...elements]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});

const params = new URLSearchParams(url.search);
const numberOfPeriodsValue = params.get('number-of-periods');
const interestRateValue = params.get('interest-rate');

numberOfPeriods.value = numberOfPeriodsValue || 5;
updateResultantNumberOfPeriods(numberOfPeriodsValue || 5);

if (interestRateValue) { 
  interestRate.value = interestRateValue;
  resultantInterestRate.innerText = interestRateValue + '%';
} else {
  resultantInterestRate.innerText = '0.0%';
}

for (let period = 0; period <= numberOfPeriodsValue; period++) {
  let id = `${period}${getSuperScript(period)}-year`;
 
  if (params.has(id)) {
    const value = params.get(id);
    cashFlows[period] = parseInt(value.replace(/\$|,/g, ''));
  }
}

updateCashFlowContainer();