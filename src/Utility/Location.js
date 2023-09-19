//created to reach out to google servers for API to translate the user input into coordinates

const GOOGLE_API_KEY = 'AIzaSyDwMA8t7jIonhwGmdWZBzjdAG68P_p9_PQ';

export async function getAddressFromCoords(coords) {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_API_KEY}`);

    if (!response.ok) {
        throw new Error('Failed to fetch address. Please try again...'); // Error is a globally available constructor() in JS
    }
    const data = await response.json();
    if (data.error_message) { // checks for errors that could occur with google even in the presence a 200 staus code
        throw new Error(data.error_message); // error_message is a property in the response body
    }
    const address = data.results[0].formatted_address; // //results is a Maps API array whos first element is an object with a formated address property with a value that renders the adddress in the format desired here
    return address;
}

export async function getCoordsFromAddress(address) {
    const urlAdress = encodeURI(address); //made available by the browser api. encodes urls so they can be sent to the server.
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${urlAdress}&key=${GOOGLE_API_KEY}`);
    if (!response.ok) {
        throw new Error('Failed to fetch coordinates. Please try again...') // Error is a globally available constructor() in JS
    }
    const data = await response.json()
    if (data.error_message) { // checks for errors that could occur with google even in the presence a 200 staus code
        throw new Error(data.error_message) // error_message is a property in the response body
    }
    const coordinates = data.results[0].geometry.location; //results is a Maps API array whos first element is an object with a geometry property object with a location property
    return coordinates;
}
