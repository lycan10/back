const express = require('express');
require('dotenv').config();
const shippo = require('shippo')("shippo_test_6b1434047e32cf566ec052161801686255ca9b89");
const bodyParser = require('body-parser')
const cors = require('cors');
const countryList = require('country-list'); 
const usStateCodes = require('us-state-codes');
const UsaStates = require('usa-states').UsaStates;

const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:3002', // Replace with your client's origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.get('/', (req, res) => {
    res.send('Welcome to the Shippo API example!');
});

app.post('/api/rates', async (req, res) => {
  try {
   
    const country = req.body.data.country;
    let countryCode;

    if (country === "United States") {
      countryCode = countryList.getCode("United States of America");
    } else {
      countryCode = countryList.getCode(country);
    }

    const dataStates = req.body.data.state;

var usStates = new UsaStates();
var statesAbbreviation = usStates.arrayOf('abbreviations');
var statesNames = usStates.arrayOf('names');
let abbreviation = ""


const indexOfState = statesNames.indexOf(dataStates);
if (indexOfState !== -1) {
  // If the state name is found, log the corresponding abbreviation
  abbreviation = statesAbbreviation[indexOfState];
} else {
  console.log('State not found in the list');
}


    if (!countryCode) {
      throw new Error('Country code not found for the provided country name');
    }

    // Create addresses for testing purposes
    const addressFrom = await shippo.address.create({
      "name": "Gbogboade Ikechukwu",
      "company": "Total Trailers",
      "street1": "1747 E Auburn Rd",
      "city": "Rochester Hills",
      "state": "MI",
      "zip": "48307",
      "country": "US",
      "phone": "+1 734 829 0776",
      "email": "totaltrailerdev@gmail.com",
    });

    const addressTo = await shippo.address.create({
      "name": req.body.data.firstName,
      "company": req.body.data.company,
      "street1": req.body.data.streetAddress,
      "city": req.body.data.city,
      "state": abbreviation,
      "zip": req.body.data.zipCode,
      "country": countryCode,
      "phone": req.body.data.phoneNumber,
      "email": req.body.data.email,
    });

    // Create a shipment with the required details, including the parcel directly
    const shipment = await shippo.shipment.create({
      "address_from": addressFrom,
      "address_to": addressTo, // Fix: Change address_from to address_to
      "parcels": [{ // Add parcel details
        "length": 5,
        "width": 5,
        "height": 5,
        "distance_unit": "in",
        "weight": 2,
        "mass_unit": "lb",
      }],
    });
  
   


    // Retrieve shipping rates for the created shipment
    const rates = await shippo.shipment.rates(shipment.object_id);
    console.log(rates)
    res.json({ success: true, rates });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});






app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});