import { renderDeleteIcon, amountConfig, numberWithCommas, validateAmount, insertErrorMessage, removeErrorMessage, insertWarningMessage, removeWarningMessage, PMT } from "../utils/utils.js";
/* --------------------Building Data-------------------------- */
const stabilizedUnitInputContainer = document.querySelector('.stabilized-unit-inputs-container');
const resultantStabilizedUnitContainer = document.querySelector('.resultant-stabilized-unit-container');
const addNewRowButton = document.getElementById('add-new-row');
const totalUnits = document.getElementById('total-units');
const totalRent = document.getElementById('total-rent');
const totalAnnualRent = document.getElementById('total-annual-rent');
// share link
const shareResultButton = document.getElementById('share-result');
const shareLink = document.getElementById('share-link');
const copyText = document.getElementById('copy-text');
const url = new URL(window.location.href);
// building data input selectors
const stabilizedUnitInputSelectors = ['.unit-type-br', '.unit-type-ba', '.number-of-units', '.average-rent-per-month'];
// validate br and ba values
const validatebrba = (e) => { 
  let value = e.target.value;
  let inputContainer = e.target.closest(".input-container");
  let errorMessage = document.createElement('div');
  errorMessage.classList.add('error-label');
  errorMessage.innerText = 'Please select a value between 0 and 10 (inclusive)';
  let isErrorLablePresent = inputContainer.lastChild.classList ? true : false;
  
  if (value > 10) {
    e.target.value = 10;
    e.target.style.borderColor = 'red';
    if(!isErrorLablePresent) inputContainer.appendChild(errorMessage);
  } else {
    e.target.style.borderColor = '';
    if(isErrorLablePresent) inputContainer.removeChild(inputContainer.lastChild);
  }
}
// remove event listeners from inputs when row is deleted
const removeAllInputsEventListeners = (id) => { 
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);
  
  [br, ba].forEach(element => element.removeEventListener('input', handleBrBaInputs, false));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  numberOfUnits.removeEventListener('input', handleNumberOfUnits, false);

  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  averageRentPerMonth.removeEventListener('input', handleAverageRentPerMonth, false);
}
// delete row from input container & result container
const deleteRowFromContainer = (id) => { 
  let row = document.getElementById(`row-${id}`);
  stabilizedUnitInputContainer.removeChild(row);
  row = document.getElementById(`resultant-row-${id}`);
  resultantStabilizedUnitContainer.removeChild(row);
}
// add new row to input container
const addNewRowToContainer = (id) => {   
  const row = document.createElement('div');
  row.classList.add('row');
  row.id = `row-${id}`;
  row.innerHTML = `
    <div class="input-container">
      <div class="input-label">
        <label for="unit-type">Unit Type</label>
      </div>
      <div class="input-wrapper">
        <div class="input-row">
          <span class="rounded-left">br</span>
          <input type="number" name="unit-type" id="unit-type-br-${id}" class="unit-type-br short-input rounded-right" placeholder="0" min="0" step="1" />
        </div>
        <div class="input-row">
          <input type="number" name="unit-type" id="unit-type-ba-${id}" class="unit-type-ba short-input rounded-left" placeholder="0" min="0" step="1" />
          <span class="rounded-right">ba</span>
        </div>
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="number-of-units">Number of Units</label>
      </div>
      <div class="input-wrapper">
        <input type="number" name="number-of-units" id="number-of-units-${id}" class="number-of-units" placeholder="0" min="0" step="1" />
      </div>
    </div>

    <div class="input-container">
      <div class="input-label">
        <label for="average-rent-per-month">Average Rent per Month</label>
      </div>
      <div class="input-wrapper">
        <span class="rounded-left">$</span>
        <input type="text" name="average-rent-per-month" id="average-rent-per-month-${id}" class="average-rent-per-month rounded-right" min="0" step="1" placeholder="0" />
      </div>
    </div>
  `;

  const deleteIcon = renderDeleteIcon(row);
  deleteIcon.addEventListener('click', () => { 
    removeAllInputsEventListeners(id);
    deleteRowFromContainer(id);
    updateTotalValues();
  });

  stabilizedUnitInputContainer.appendChild(row);
  const averageRentPerMonth = new AutoNumeric(`#average-rent-per-month-${id}`, amountConfig);
  averageRentPerMonth.domElement.addEventListener('input', validateAmount);
}
// add new row to result container
const addNewRowToResultantContainer = (id) => { 
  const row = document.createElement('div');
  row.classList.add('resultant-stabilized-unit-container-row');
  row.id = `resultant-row-${id}`;
  row.innerHTML = `
    <h4 id="resultant-unit-type-${id}">0 br / 0 ba</h4>
    <h4 id="resultant-number-of-units-${id}">0</h4>
    <h4 id="resultant-average-rent-per-month-${id}">$0</h4>
    <h4 id="total-annual-rent-${id}" class="total-annual-rent">$0</h4>
  `;

  resultantStabilizedUnitContainer.appendChild(row);
}
// calculate and update `total units`, `total average rent per month` and `total annual rent` on result container
const updateTotalValues = () => { 
  const numberOfUnits = document.querySelectorAll('.number-of-units');
  const totalNumberOfUnits = Array.from(numberOfUnits).reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
  totalUnits.innerText = numberWithCommas(totalNumberOfUnits);

  const averageRentPerMonth = document.querySelectorAll('.average-rent-per-month');
  const totalAvRentPerMonth = (Array.from(averageRentPerMonth).reduce((acc, curr, index) => acc + (parseInt(curr.value.replace(/\,/g, '')) || 0) * numberOfUnits[index].value, 0));
  totalRent.innerText = (totalAvRentPerMonth === 'NaN') ? '$0' : '$' + numberWithCommas(totalAvRentPerMonth);

  const resultantTotalAnnualRent = document.querySelectorAll('.total-annual-rent');
  const totalAnnualRentValue = Array.from(resultantTotalAnnualRent).reduce((acc, curr) => acc + (parseInt(curr.innerText.replace(/\,|\$/g, '')) || 0), 0);
  totalAnnualRent.innerText = '$' + numberWithCommas(totalAnnualRentValue);
  resultantPotentialIncome.innerText = '$' + numberWithCommas(totalAnnualRentValue);

  calculateVacancyCreditLoss();
  calculateOtherIncome();
}
/*
  Calculate and update `total annual rent` on result container
  Total Annual Rent = Total Units * Total Average Rent per Month * 12
*/
const calculateTotalAnnualRent = (id, numberOfUnits, averageRentPerMonth) => { 
  const totalAnnualRent = document.getElementById(`total-annual-rent-${id}`);
  averageRentPerMonth = parseInt(averageRentPerMonth.replace(/\,/g, '')) || 0;
  const totalAnnualRentValue = numberOfUnits * averageRentPerMonth * 12; 
  totalAnnualRent.innerText = `$${numberWithCommas(totalAnnualRentValue)}`;
  updateTotalValues();
  // shareLink.value = generateSharableLink();
}

const handleBrBaInputs = (id, brValue, baValue) => { 
  const resultantUnitType = document.getElementById(`resultant-unit-type-${id}`);
  resultantUnitType.innerText = `${brValue}br / ${baValue}ba`;
  // shareLink.value = generateSharableLink();
}

const handleNumberOfUnits = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantNumberOfUnits = document.getElementById(`resultant-number-of-units-${id}`);
  resultantNumberOfUnits.innerText = numberOfUnitsValue;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}

const handleAverageRentPerMonth = (id, numberOfUnitsValue, averageRentPerMonthValue) => { 
  const resultantAverageRentPerMonth = document.getElementById(`resultant-average-rent-per-month-${id}`);
  resultantAverageRentPerMonth.innerText = `$${averageRentPerMonthValue}`;
  calculateTotalAnnualRent(id, numberOfUnitsValue, averageRentPerMonthValue);
}
// add event listeners to inputs and update values on result container
const addEventListnersToInputs = (id) => {
  const br = document.getElementById(`unit-type-br-${id}`);
  const ba = document.getElementById(`unit-type-ba-${id}`);

  [br, ba].forEach(element => element.addEventListener('input', (e) => { handleBrBaInputs(id, br.value, ba.value); validatebrba(e) }));

  const numberOfUnits = document.getElementById(`number-of-units-${id}`);
  const averageRentPerMonth = document.getElementById(`average-rent-per-month-${id}`);
  
  numberOfUnits.addEventListener('input', () => handleNumberOfUnits(id, numberOfUnits.value, averageRentPerMonth.value));

  averageRentPerMonth.addEventListener('input', () => handleAverageRentPerMonth(id, numberOfUnits.value,averageRentPerMonth.value));
}
// On click of add new row button -> add new row to building data container and add event listeners to inputs
addNewRowButton.addEventListener('click', () => {
  const id = Math.random().toString(36).substring(7);
  addNewRowToContainer(id);
  addNewRowToResultantContainer(id);
  addEventListnersToInputs(id);
});
// On fresh load of page -> atleast one row should be added
addNewRowButton.click(); 
/*--------------------Stabilized Annual Operating Income----------------------- */
// Stabilized Annual Operating Income Inputs
const vacanyCreditLoss = document.getElementById('vacancy-credit-loss');
const otherIncome = new AutoNumeric('#other-income', amountConfig);
const reTaxesAndInsurance = new AutoNumeric('#taxes-and-insurance', amountConfig);
const operatingExpenses = new AutoNumeric('#operating-expenses', amountConfig);
// Stabilized Annual Operating Income Intermediate Results
const grossOperatingIncome = document.getElementById('gross-operating-income');
const totalExpenses = document.getElementById('total-expenses');
// Stabilized Annual Operating Income Resultant Result
const resultantPotentialIncome = document.getElementById('resultant-potential-income');
const resultantVacancyCreditLoss = document.getElementById('resultant-vacancy-credit-loss');
const resultantEffectiveRentalIncome = document.getElementById('resultant-effective-rental-income');
const resultantOtherIncome = document.getElementById('resultant-other-income');
const resultantGrossOperatingIncome = document.getElementById('resultant-gross-operating-income');
const resultantTaxesAndInsurance = document.getElementById('resultant-taxes-and-insurance');
const resultantOperatingExpenses = document.getElementById('resultant-operating-expenses');
const resultantTotalExpenses = document.getElementById('resultant-total-expenses');
const netOperatingIncome = document.getElementById('net-operating-income');
// Stabilized Annual Operating Income Toggle
const otherIncomeToggle = document.getElementById('other-income-toggle');
const taxesAndInsuranceToggle = document.getElementById('taxes-and-insurance-toggle');
const operatingExpensesToggle = document.getElementById('operating-expenses-toggle');
/*
  Calculate Vacany And Credit Loss
  Vacancy Credit Loss = Vacancy Credit Loss % * Total Annual Rent
*/
const calculateVacancyCreditLoss = () => { 
  const vacanyCreditLossValue = parseFloat(vacanyCreditLoss.value) || 0;
  const totalAnnualRentValue = parseInt(totalAnnualRent.innerText.replace(/\,|\$/g, '')) || 0;
  const vacancyCreditLossAmount = Math.round(vacanyCreditLossValue / 100 * totalAnnualRentValue);
  
  resultantVacancyCreditLoss.innerText = `$${numberWithCommas(vacancyCreditLossAmount)}`;

  calculateEffectiveRentalIncome(totalAnnualRentValue, vacancyCreditLossAmount);
}
/*
  Calculate Effective Rental Income
  Effective Rental Income = Total Annual Rent - Vacancy Credit Loss
*/
const calculateEffectiveRentalIncome = (totalAnuualRent, vacancyCreditLoss) => { 
  const effectiveGrossIncomeValue = totalAnuualRent - vacancyCreditLoss;

  if (effectiveGrossIncomeValue) {
    resultantEffectiveRentalIncome.innerText = `$${numberWithCommas(effectiveGrossIncomeValue)}`;
  } else {
    resultantEffectiveRentalIncome.innerText = '$0';
  }

  calculateGrossOperatingIncome();
}
/*
  Calculate Other Income
  Other Income = Other Income per unit *  Total Units
*/
const calculateOtherIncome = () => {
  const otherIncomeValue = parseFloat(otherIncome.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText.replace(/\,|\$/g, '')) || 0;
  
  let otherIncomeAmount = 0;

  if (otherIncomeToggle.checked) { 
    otherIncomeAmount = Math.round(otherIncomeValue * totalUnitsValue);
  } else {
    otherIncomeAmount = otherIncomeValue;
  }

  if (otherIncomeAmount) {
    resultantOtherIncome.innerText = `$${numberWithCommas(otherIncomeAmount)}`;  
  } else {
    resultantOtherIncome.innerText = '$0';
  }

  calculateGrossOperatingIncome();
}
/*
  Calculate Gross Operating Income
  Gross Operating Income = Effective Rental Income + Other Income
*/
const calculateGrossOperatingIncome = () => { 
  const effectiveRentalIncomeValue = parseInt(resultantEffectiveRentalIncome.innerText.replace(/\,|\$/g, '')) || 0;
  const otherIncomeValue = parseInt(resultantOtherIncome.innerText.replace(/\,|\$/g, '')) || 0;
  const grossOperatingIncomeValue = effectiveRentalIncomeValue + otherIncomeValue;

  grossOperatingIncome.innerText = `$${numberWithCommas(grossOperatingIncomeValue)}`;
  resultantGrossOperatingIncome.innerText = `$${numberWithCommas(grossOperatingIncomeValue)}`;

  calculateNetOperatingIncome();
}
/*
  Calculate Taxes and Insurance
  Taxes and Insurance = Taxes and Insurance per unit * Total Units
*/
const calculateTaxesAndInsurance = () => { 
  const reTaxesAndInsuranceValue = parseInt(reTaxesAndInsurance.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText.replace(/\,|\$/g, '')) || 0;
  
  let taxesAndInsuranceAmount = 0;

  if (taxesAndInsuranceToggle.checked) {
    taxesAndInsuranceAmount = Math.round(reTaxesAndInsuranceValue * totalUnitsValue);
  } else {
    taxesAndInsuranceAmount = reTaxesAndInsuranceValue;
  }

  resultantTaxesAndInsurance.innerText = `$${numberWithCommas(taxesAndInsuranceAmount)}`;

  calculateTotalExpenses();
}
/*
  Calculate Operating Expenses
  Operating Expenses = Operating Expenses per unit * Total Units
*/
const calculateOperatingExpenses = () => { 
  const operatingExpensesValue = parseInt(operatingExpenses.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText.replace(/\,|\$/g, '')) || 0;
  
  let operatingExpensesAmount = 0;

  if (operatingExpensesToggle.checked) {
    operatingExpensesAmount = Math.round(operatingExpensesValue * totalUnitsValue);
  } else {
    operatingExpensesAmount = operatingExpensesValue;
  }

  resultantOperatingExpenses.innerText = `$${numberWithCommas(operatingExpensesAmount)}`;

  calculateTotalExpenses();
}
/*
  Calculate Total Expenses
  Total Expenses = Taxes and Insurance + Operating Expenses
*/
const calculateTotalExpenses = () => { 
  const taxesAndInsuranceValue = parseInt(resultantTaxesAndInsurance.innerText.replace(/\,|\$/g, '')) || 0;
  const operatingExpensesValue = parseInt(resultantOperatingExpenses.innerText.replace(/\,|\$/g, '')) || 0;
  const totalExpensesValue = taxesAndInsuranceValue + operatingExpensesValue;

  totalExpenses.innerText = `$${numberWithCommas(totalExpensesValue)}`;
  resultantTotalExpenses.innerText = `$${numberWithCommas(totalExpensesValue)}`;

  calculateNetOperatingIncome();
}
/*
  Calculate Net Operating Income
  Net Operating Income = Gross Operating Income - Total Expenses
*/
const calculateNetOperatingIncome = () => { 
  const grossOperatingIncomeValue = parseInt(resultantGrossOperatingIncome.innerText.replace(/\,|\$/g, '')) || 0;
  const totalExpensesValue = parseInt(resultantTotalExpenses.innerText.replace(/\,|\$/g, '')) || 0;
  const netOperatingIncomeValue = grossOperatingIncomeValue - totalExpensesValue;

  netOperatingIncome.innerText = `$${numberWithCommas(netOperatingIncomeValue)}`;
}
// add event listeners to inputs and update values on result container
vacanyCreditLoss.addEventListener('input', calculateVacancyCreditLoss);
[otherIncome.domElement, otherIncomeToggle].forEach(element => element.addEventListener('input', calculateOtherIncome));
[reTaxesAndInsurance.domElement, taxesAndInsuranceToggle].forEach(element => element.addEventListener('input', calculateTaxesAndInsurance));
[operatingExpenses.domElement, operatingExpensesToggle].forEach(element => element.addEventListener('input', calculateOperatingExpenses));

/*---------------------------Project Timeline---------------------------- */
// Inputs
const preConstruction = document.getElementById('pre-construction');
const construction = document.getElementById('construction');
const leaseUpToStabilization = document.getElementById('lease-up-to-stabilization');
// Intermediate Result
const totalTimeline = document.getElementById('total-timeline');
// Result
const preConstructionPercent = document.getElementById('pre-construction-percent');
const perConstructionDuration = document.getElementById('pre-construction-duration');
const constructionPercent = document.getElementById('construction-percent');
const constructionDuration = document.getElementById('construction-duration');
const leaseUpToStabilizationPercent = document.getElementById('lease-up-to-stabilization-percent');
const leaseUpToStabilaizationDuration = document.getElementById('lease-up-to-stabilization-duration');
const totalPercent = document.getElementById('total-percent-of-duration');
const totalDuration = document.getElementById('total-duration');
/*
  Calculate Total Timeline
  Total Timeline = Pre-Construction + Construction + Lease Up To Stabilization
*/
const calculateTotalTimeline = () => { 
  const preConstructionDurationValue = parseInt(preConstruction.value) || 0;
  const constructionDurationValue = parseInt(construction.value) || 0;
  const leaseUpToStabilizationValue = parseInt(leaseUpToStabilization.value) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText.replace(/\,|\$/g, '')) || 0;
  const vacancyCreditLossValue = parseInt(vacanyCreditLoss.value) || 0;
  let leaseUpToStabilizationDurationValue = 0;

  if (totalUnitsValue && vacancyCreditLossValue && leaseUpToStabilizationValue) {
    leaseUpToStabilizationDurationValue = Math.round(totalUnitsValue * (1 - vacancyCreditLossValue / 100) / leaseUpToStabilizationValue) || 0;
  }
  
  perConstructionDuration.innerText = `${preConstructionDurationValue} months`;
  constructionDuration.innerText = `${constructionDurationValue} months`;
  leaseUpToStabilaizationDuration.innerText = `${leaseUpToStabilizationDurationValue} months`;

  const totalDurationValue = preConstructionDurationValue + constructionDurationValue + leaseUpToStabilizationDurationValue;

  totalTimeline.innerText = `${totalDurationValue} months`;
  totalDuration.innerText = `${totalDurationValue} months`;

  const preConstructionPercentValue = (preConstructionDurationValue / totalDurationValue * 100).toFixed(1) || 0;
  const constructionPercentValue = (constructionDurationValue / totalDurationValue * 100).toFixed(1) || 0;
  const leaseUpToStabilizationPercentValue = (leaseUpToStabilizationDurationValue / totalDurationValue * 100).toFixed(1) || 0;

  preConstructionPercent.innerText = `${preConstructionPercentValue}%`;
  constructionPercent.innerText = `${constructionPercentValue}%`;
  leaseUpToStabilizationPercent.innerText = `${leaseUpToStabilizationPercentValue}%`;

  const totalPercentValue = Math.round(parseFloat(preConstructionPercentValue) + parseFloat(constructionPercentValue) + parseFloat(leaseUpToStabilizationPercentValue));

  totalPercent.innerText = `${totalPercentValue}%`;
}

[preConstruction, construction, leaseUpToStabilization].forEach(element => element.addEventListener('input', calculateTotalTimeline));

// --------------------------Development Sources & Uses of Funds-------------------------
// Inputs
const landCost = new AutoNumeric('#land-cost', amountConfig);
const hardCosts = new AutoNumeric('#hard-costs', amountConfig);
const hardCostsContingency = document.getElementById('hard-costs-contingency');
const softCosts = document.getElementById('soft-costs');
const softCostsContingency = document.getElementById('soft-costs-contingency');
const seniorConstructionLoanLTC = document.getElementById('senior-construction-loan-ltc');
const constructionLoanInterest = document.getElementById('construction-loan-interest');
// Intermediate Result
const totalProjectCost = document.getElementById('total-project-cost');
// Result
const landCostPercent = document.getElementById('percent-of-tpc-land-cost');
const landCostAmount = document.getElementById('land-cost-amount');
const resultantHardCost = document.getElementById('resultant-hard-cost');
const hardCostPercent = document.getElementById('percent-of-tpc-hard-cost');
const hardCostAmount = document.getElementById('hard-cost-amount');
const resultantHardCostsContingency = document.getElementById('resultant-hard-costs-contingency');
const hardCostsContingencyPercent = document.getElementById('percent-of-tpc-hard-costs-contingency');
const hardCostsContingencyAmount = document.getElementById('hard-costs-contingency-amount');
const resultantSoftCosts = document.getElementById('resultant-soft-costs');
const softCostsPercent = document.getElementById('percent-of-tpc-soft-costs');
const softCostsAmount = document.getElementById('soft-costs-amount');
const resultantSoftCostsContingency = document.getElementById('resultant-soft-costs-contingency');
const softCostsContingencyPercent = document.getElementById('percent-of-tpc-soft-costs-contingency')
const softCostsContingencyAmount = document.getElementById('soft-costs-contingency-amount');
const resultantConstructionLoanInterest = document.getElementById('resultant-construction-loan-interest');
const constructionLoanInterestPercent = document.getElementById('percent-of-tpc-construction-loan-interest');
const constructionLoanInterestAmount = document.getElementById('construction-loan-interest-amount');
const operatingDeficitPercent = document.getElementById('percent-of-tpc-operating-deficit');
const operatingDeficitAmount = document.getElementById('operating-deficit-amount');
const totalPercentOfTPC = document.getElementById('total-percent-of-tpc');
const totalAmount = document.getElementById('total-amount');
/*
  Calculate Total Project Cost
*/
const calculateTotalProjectCost = () => { 
  let totalProjectCostValue = 0;
  // land cost amount
  const landCostValue = parseInt(landCost.rawValue) || 0;
  landCostAmount.innerText = `$${numberWithCommas(landCostValue)}`;
  // hard costs amount
  const hardCostsValue = parseInt(hardCosts.rawValue) || 0;
  const totalUnitsValue = parseInt(totalUnits.innerText.replace(/\,|\$/g, '')) || 0;
  const hardCostsAmountValue = hardCostsValue * totalUnitsValue;
  hardCostAmount.innerText = `$${numberWithCommas(hardCostsAmountValue)}`;
  resultantHardCost.innerText = `$${numberWithCommas(hardCostsValue)}/unit`;
  // hard costs contingency amount
  const hardCostsContingencyValue = parseFloat(hardCostsContingency.value) || 0;
  const hardCostsContingencyAmountValue = hardCostsContingencyValue / 100 * hardCostsAmountValue;
  hardCostsContingencyAmount.innerText = `$${numberWithCommas(hardCostsContingencyAmountValue)}`;
  resultantHardCostsContingency.innerText = `${hardCostsContingencyValue}%`;
  // soft costs amount
  const softCostsValue = parseFloat(softCosts.value) || 0;
  const softCostsAmountValue = softCostsValue / 100 * hardCostsAmountValue;
  softCostsAmount.innerText = `$${numberWithCommas(softCostsAmountValue)}`;
  resultantSoftCosts.innerText = `${softCostsValue}%`;
  // soft costs contingency amount
  const softCostsContingencyValue = parseFloat(softCostsContingency.value) || 0;
  const softCostsContingencyAmountValue = softCostsContingencyValue / 100 * softCostsAmountValue;
  softCostsContingencyAmount.innerText = `$${numberWithCommas(softCostsContingencyAmountValue)}`;
  resultantSoftCostsContingency.innerText = `${softCostsContingencyValue}%`;
  // construction loan interest amount
  const constructionLoanInterestValue = parseFloat(constructionLoanInterest.value) || 0;
  const seniorConstructionLoanLTCValue = parseFloat(seniorConstructionLoanLTC.value) || 0;
  const totalTimelineValue = parseInt(totalTimeline.innerText.replace(/\,|months/g, '')) || 0;
  totalProjectCostValue = landCostValue + hardCostsAmountValue + hardCostsContingencyAmountValue + softCostsAmountValue + softCostsContingencyAmountValue;  
  const constructionLoanInterestAmountValue = Math.round((constructionLoanInterestValue / 100) * (totalTimelineValue / 12 / 2) * (seniorConstructionLoanLTCValue / 100) * totalProjectCostValue);
  constructionLoanInterestAmount.innerText = `$${numberWithCommas(constructionLoanInterestAmountValue)}`;
  resultantConstructionLoanInterest.innerText = `${constructionLoanInterestValue}%`;
  // total project cost
  totalProjectCost.innerText = `$${numberWithCommas(totalProjectCostValue)}`;
  totalAmount.innerText = `$${numberWithCommas(totalProjectCostValue)}`;
  // land cost percent
  const landCostPercentValue = (landCostValue / totalProjectCostValue * 100).toFixed(1);
  landCostPercent.innerText = `${landCostPercentValue}%`
  // hard costs percent
  const hardCostsPercentValue = (hardCostsAmountValue / totalProjectCostValue * 100).toFixed(1);
  hardCostPercent.innerText = `${hardCostsPercentValue}%`;
  // hard costs contingency percent
  const hardCostsContingencyPercentValue = (hardCostsContingencyAmountValue / totalProjectCostValue * 100).toFixed(1);
  hardCostsContingencyPercent.innerText = `${hardCostsContingencyPercentValue}%`;
  // soft costs percent
  const softCostsPercentValue = (softCostsAmountValue / totalProjectCostValue * 100).toFixed(1);
  softCostsPercent.innerText = `${softCostsPercentValue}%`;
  // soft costs contingency percent
  const softCostsContingencyPercentValue = (softCostsContingencyAmountValue / totalProjectCostValue * 100).toFixed(1);
  softCostsContingencyPercent.innerText = `${softCostsContingencyPercentValue}%`;
  // construction loan interest percent
  const constructionLoanInterestPercentValue = (constructionLoanInterestAmountValue / totalProjectCostValue * 100).toFixed(1);
  constructionLoanInterestPercent.innerText = `${constructionLoanInterestPercentValue}%`;
  // total percent of tpc
  const totalPercentOfTPCValue = Math.round(parseFloat(landCostPercentValue) + parseFloat(hardCostsPercentValue) + parseFloat(hardCostsContingencyPercentValue) + parseFloat(softCostsPercentValue) + parseFloat(softCostsContingencyPercentValue) + parseFloat(constructionLoanInterestPercentValue));
  totalPercentOfTPC.innerText = `${totalPercentOfTPCValue}%`;

  calculateTotalSourcesOfFunds();
}
// add event listener to calculate total project cost
[landCost.domElement, hardCosts.domElement, hardCostsContingency, softCosts, softCostsContingency, seniorConstructionLoanLTC, constructionLoanInterest].forEach(element => element.addEventListener('input', calculateTotalProjectCost));

// Sources of Funds
// Results
const seniorConstructionLoanPercent = document.getElementById('senior-construction-loan-percent');
const seniorConstructionLoanAmount = document.getElementById('senior-construction-loan-amount');
const requiredEquityPercent = document.getElementById('required-equity-percent');
const requiredEquityAmount = document.getElementById('required-equity-amount');
const totalSourcesPercent = document.getElementById('total-sources-percent');
const totalSourcesAmount = document.getElementById('total-sources-amount');
// Calculate Total Sources of Funds
const calculateTotalSourcesOfFunds = () => { 
  const seniorConstructionLoanLTCValue = parseFloat(seniorConstructionLoanLTC.value) || 0;
  const totalProjectCost = parseInt(totalAmount.innerText.replace(/\,|\$/g, '')) || 0;

  const seniorConstructionLoanAmountValue = Math.round((seniorConstructionLoanLTCValue / 100) * totalProjectCost);
  seniorConstructionLoanAmount.innerText = `$${numberWithCommas(seniorConstructionLoanAmountValue)}`;

  const requiredEquityAmountValue = totalProjectCost - seniorConstructionLoanAmountValue;
  requiredEquityAmount.innerText = `$${numberWithCommas(requiredEquityAmountValue)}`;

  const totalSourcesAmountValue = seniorConstructionLoanAmountValue + requiredEquityAmountValue;
  totalSourcesAmount.innerText = `$${numberWithCommas(totalSourcesAmountValue)}`;

  const seniorConstructionLoanPercentValue = (seniorConstructionLoanAmountValue / totalSourcesAmountValue * 100).toFixed(1);
  seniorConstructionLoanPercent.innerText = `${seniorConstructionLoanPercentValue}%`;

  const requiredEquityPercentValue = (requiredEquityAmountValue / totalSourcesAmountValue * 100).toFixed(1);
  requiredEquityPercent.innerText = `${requiredEquityPercentValue}%`;

  const totalSourcesPercentValue = Math.round(parseFloat(seniorConstructionLoanPercentValue) + parseFloat(requiredEquityPercentValue));
  totalSourcesPercent.innerText = `${totalSourcesPercentValue}%`;
}