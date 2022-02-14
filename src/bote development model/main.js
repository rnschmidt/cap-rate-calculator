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
  const totalAvRentPerMonth = (Array.from(averageRentPerMonth).reduce((acc, curr, index) => acc + (parseInt(curr.value.replace(/\,/g, '')) || 0) * numberOfUnits[index].value, 0) / totalNumberOfUnits).toFixed(2);
  totalRent.innerText = (totalAvRentPerMonth === 'NaN') ? '$0' : '$' + numberWithCommas(totalAvRentPerMonth);

  const resultantTotalAnnualRent = document.querySelectorAll('.total-annual-rent');
  const totalAnnualRentValue = Array.from(resultantTotalAnnualRent).reduce((acc, curr) => acc + (parseInt(curr.innerText.replace(/\,|\$/g, '')) || 0), 0);
  totalAnnualRent.innerText = '$' + numberWithCommas(totalAnnualRentValue);
  resultantPotentialIncome.innerText = '$' + numberWithCommas(totalAnnualRentValue);

  calculateTotalOtherIncome();
  calculatePricePerUnit();
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