
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async () => {

    let result = null;

    const FLIGHTS = [
        {
            //airline: contract.airlines[1],
            flight: 'SV-NYC',
            timestamp: Math.floor(Date.now() / 1000 - 250000)
        }
        ,
        {
            //airline: contract.airlines[1],
            flight: 'PK-LHR',
            timestamp: Math.floor(Date.now() / 1000 + 250000)
        }
    ]

    let contract = new Contract('localhost', () => {
        DOM.elid('airline-address').value = contract.airlines[0];
        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error, result);
            display('display-status', 'Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: JSON.stringify(result) }]);
        });

        display('flights-wrapper', 'Flights', 'Available Flights', [{ label: 'Flights', value: JSON.stringify(FLIGHTS, null, '\t') }]);

        // Watch Events
        contract.onEventAirlineRegistered((error, result) => {
            displayResult('Airline Registration', airline + ' : ' + result);
        });
        contract.onEventAirlineFunded((error, result) => {
            displayResult('Airline Funding', JSON.stringify(result));
        });
        contract.onEventFlightRegistered((error, result) => {
            displayResult('Flight Registered', JSON.stringify(result));
        });
        contract.onEventInsurancePurchased((error, result) => {
            display('insurance-wrapper', 'Insurance Purchased', '', [{ label: 'Passengers insurance', error: error, value: JSON.stringify(result) }]);
        });


        // Read transaction
        contract.fetchFlightInfo((error, result) => {
            display('display-wrapper', 'Flight Info', '', [{ label: 'Flight Info', error: error, value: JSON.stringify(result) }]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let flight = DOM.elid('flight-number').value;
            let timestamp = FLIGHTS[0].timestamp;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, timestamp, (error, result) => {
                console.log(result);
                display('display-wrapper', 'Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: JSON.stringify(result) }]);
            });
        });


        // Register Airline
        DOM.elid('register-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            // Write transaction
            contract.regeisterAirline(airline, (error, result) => {
                console.log('regeisterAirline : ', result, error);
                displayResult('Airline Registration', airline + ' : pending', error);
            });
        });

        // Fund Airline
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let seedFund = DOM.elid('seed-funding').value;
            // Write transaction
            contract.fundAirline(airline, seedFund, (error, result) => {
                console.log('fundAirline : ', result, error);
                displayResult('Airline Funding ', airline + ' : pending', error);
            });
        });


        // Register Flights
        DOM.elid('get-flights').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            FLIGHTS.forEach(obj => {
                // Write transaction
                contract.registerFlight(airline, obj.flight, obj.timestamp, (error, result) => {
                    console.log('regeisterFlight : ', result, error);
                    if (error) {
                        displayResult('Flights Registration', '', error);
                    } else {
                        display('flights-wrapper', 'Flights', 'Register Flights', [{ label: 'Flight', error: error, value: JSON.stringify(result) }]);
                    }
                });
            });
        });

        DOM.elid('purchase-insurance').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let flight = DOM.elid('flight-number').value;
            let select = DOM.elid('passenger-id');
            let passenger = select.options[select.selectedIndex].value;
            let amount = DOM.elid('insurance-amount').value;

            let timestamp;
            for (let i=0; i<FLIGHTS.length; i++) {
                if (FLIGHTS[i].flight == flight) {
                    timestamp = FLIGHTS[0].timestamp;
                }
            }
            
            contract.buyInsurance(airline, flight, timestamp, passenger, amount, (error, result) => {
                console.log('buyInsurance : ', result, error);
                if (error) {
                    displayResult('Insurance', '', error);
                } else {
                    displayResult('Insurance', result, '');
                }
            });
        });

        displayPassengers('passenger-id', contract.passengers);

    });

})();

function displayPassengers(id, accounts) {
    var select = DOM.elid(id);
    accounts.forEach(acc => {
        var option = document.createElement("option");
        option.value = acc;
        option.innerHTML = acc;
        select.options.add(option);
    });

}

function displayResult(title, result, error) {
    console.log('Display error : ' + error);
    let heading = DOM.elid('global-heading');
    heading.innerHTML = title;

    let resultP = DOM.elid('global-result');
    resultP.innerHTML = '';
    if (result) {
        resultP.innerHTML = 'Tx ID : ' + result;
    }

    let errorP = DOM.elid('global-error');
    errorP.innerHTML = '';
    if (error) {
        errorP.innerHTML = error;
    }

}

function display(id, title, description, results) {
    let displayDiv = DOM.elid(id);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-4 field' }, result.label));
        row.appendChild(DOM.div({ className: 'col-sm-8 field-value' }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}