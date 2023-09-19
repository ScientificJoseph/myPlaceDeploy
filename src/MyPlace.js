import { Map } from './UI/Map';
import sanitizeHtml from 'sanitize-html';

class LoadedPlace {
    constructor(coordinates, address) {
        new Map(coordinates);
        const headerTitleEl = document.querySelector('header h1');
        headerTitleEl.textContent = sanitizeHtml(address);
    }
}

const url = new URL(location.href); //URL API gets passed current URL via location.href
const queryParams = url.searchParams; // searchParams API provide a way to get the data in the URL query parameters
const coords = { // object containg lat anf lng
    lat: +queryParams.get('lat'), // parseFloat converts string into number
    lng: +queryParams.get('lng') // + converts string into number
};

const address = queryParams.get('address'); //parsed automaticall into human readable format

new LoadedPlace(coords, address);