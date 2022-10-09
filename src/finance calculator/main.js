import {
  FV,
  PV,
  PMT,
  NPER,
  amountConfig,
  numberWithCommas,
  RATE,
  generateSharableLink,
  parseFromUrl,
} from '../utils/utils.js';

const calculate = document.getElementById('calculate');
const numberOfCompoundingYears = document.getElementById('N');
const interestPeriod = document.getElementById('IY');
const periodicPayment = new AutoNumeric('#PMT', amountConfig);
const futureValue = new AutoNumeric('#FV', amountConfig);
const presentValue = new AutoNumeric('#PV', amountConfig);
const intermediateResultName = document.getElementById('intermediate-result-left');
const intermediateResultValue = document.getElementById('intermediate-result-right');
const validateInterestPeriod = document.querySelector('.float-field-2');
let hidden = 'PV';
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);

export const validateFloating = (e) => {
  const t = e.target.value;
  if (t.indexOf(".") >= 0) {
    e.target.value = t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 4);
  }
}

const getLabel = {
  PV: 'Present Value (PV)',
  FV: 'Future Value (FV)',
  PMT: 'Periodic Payment (PMT)',
  N: 'Number of Compounding Years (N)',
  IY: 'Interest Period (I/Y)'
};

const updateInputContainer = (e) => { 
  let selected = e ? e.target.value : calculate.value;
  if (hidden === selected) return;

  let hiddenInput = document.getElementById(hidden);
  let hiddenWrapper = hiddenInput.parentElement;
  let hiddenContainer = hiddenWrapper.parentElement;
  let selectedInput = document.getElementById(selected);
  let selectedWrapper = selectedInput.parentElement;
  let selectedContainer = selectedWrapper.parentElement;

  hiddenContainer.classList.remove('hide');
  selectedContainer.classList.add('hide');
  hidden = selectedInput.id;
  intermediateResultName.innerText = getLabel[hidden];

  switch (selected) { 
    case 'PV': calculatePresentValue(); break;
    case 'FV': calculateFutureValue(); break;
    case 'PMT': calculatePeriodicPayment(); break;
    case 'N': calculateNumberOfCompoundingYears(); break;
    case 'IY': calculateInterestPeriod(); break;
  }

  shareLink.value = generateSharableLink(url, [
    calculate,
    numberOfCompoundingYears,
    interestPeriod,
    futureValue,
    presentValue,
    periodicPayment
  ]);
}

const calculatePresentValue = () => {
  const rate = parseFloat(interestPeriod.value) || 0;
  const nper = parseInt(numberOfCompoundingYears.value) || 0;
  const pmt = parseInt(periodicPayment.rawValue) || 0;
  const fv = parseInt(futureValue.rawValue) || 0;
  let pv = Math.round(PV(rate / 100, nper, pmt, fv));
  
  if (pv) {
    intermediateResultValue.innerText = numberWithCommas(pv);
  } else {
    intermediateResultValue.innerText = '$0';
  }
}

const calculateFutureValue = () => {
  const rate = parseFloat(interestPeriod.value) || 0;
  const nper = parseInt(numberOfCompoundingYears.value) || 0;
  const pmt = parseInt(periodicPayment.rawValue) || 0;
  const pv = parseInt(presentValue.rawValue) || 0;
  const fv = Math.round(FV(rate / 100, nper, pmt, pv));

  if (fv) {
    intermediateResultValue.innerText = numberWithCommas(fv);
  } else {
    intermediateResultValue.innerText = '$0';
  }
}

const calculatePeriodicPayment = () => {
  const rate = parseFloat(interestPeriod.value) || 0;
  const nper = parseInt(numberOfCompoundingYears.value) || 0;
  const pv = parseInt(presentValue.rawValue) || 0;
  const fv = parseInt(futureValue.rawValue) || 0;
  const pmt = Math.round(PMT(rate / 100, nper, pv, fv));
  
  if (pmt) {
    intermediateResultValue.innerText = numberWithCommas(pmt);
  } else {
    intermediateResultValue.innerText = '$0';
  }
 }

const calculateNumberOfCompoundingYears = () => {
  const rate = parseFloat(interestPeriod.value) || 0;
  const pv = parseInt(presentValue.rawValue) || 0;
  const fv = parseInt(futureValue.rawValue) || 0;
  const pmt = parseInt(periodicPayment.rawValue) || 0;
  const nper = Math.round(NPER(rate / 100, pmt, pv, fv));

  if (nper) {
    intermediateResultValue.innerText = nper + 'years';
  } else {
    intermediateResultValue.innerText = '0 year';
  }
}

const calculateInterestPeriod = () => { 
  const nper = parseInt(numberOfCompoundingYears.value) || 0;
  const pv = parseInt(presentValue.rawValue) || 0;
  const fv = parseInt(futureValue.rawValue) || 0;
  const pmt = parseInt(periodicPayment.rawValue) || 0;
  const rate = (RATE(nper, pmt, pv, fv) * 100).toFixed(2);
  
  if (rate !== 'NaN') {
    intermediateResultValue.innerText = rate + '%';
  } else {
    intermediateResultValue.innerText = '0%';
  }
}

calculate.addEventListener('change', updateInputContainer);

[interestPeriod, numberOfCompoundingYears, periodicPayment.domElement, futureValue.domElement, presentValue.domElement].forEach(input => input.addEventListener('input', () => { 
  shareLink.value = generateSharableLink(url, [
    calculate,
    numberOfCompoundingYears,
    interestPeriod,
    futureValue,
    presentValue,
    periodicPayment
  ]);

  switch (hidden) { 
    case 'PV': calculatePresentValue(); break;
    case 'FV': calculateFutureValue(); break;
    case 'PMT': calculatePeriodicPayment(); break;
    case 'N': calculateNumberOfCompoundingYears(); break;
    case 'IY': calculateInterestPeriod(); break;
  }
}));
// add event listner to validate floating point
validateInterestPeriod.addEventListener('input', validateFloating, false);
// add event listner for share result button to generate new sharable link
shareResultButton.addEventListener('click', () => {
  let link = generateSharableLink(url, [calculate, numberOfCompoundingYears, interestPeriod, futureValue, presentValue, periodicPayment]);
  shareLink.value = link;
  shareLink.style.width = 'calc(100% - 3.5rem)';
  shareLink.style.padding = '0.5rem';
  copyText.style.opacity = '1';
});
// parse values from url and call the updateDOM function and calculateRuleOf72 function
parseFromUrl(url, [updateInputContainer]);