import { Modal } from './UI/Modal'
import { Map } from './UI/Map';
import {getCoordsFromAddress, getAddressFromCoords} from './Utility/Location'

class PlaceFinder {
    constructor() {
        const addressForm = document.querySelector('form');
        const locateUserBtn = document.getElementById('locate-btn');
        this.shareBtn = document.getElementById('share-btn')

        locateUserBtn.addEventListener('click', this.locateUserHandler.bind(this)); // binds button this to Class instead of button
        this.shareBtn.addEventListener('click', this.sharePlaceHandler)
        addressForm.addEventListener('submit', this.findAddressHandler.bind(this))
      
    }

    sharePlaceHandler() {
        const sharedLinkInputElement = document.getElementById('share-link');
        if (!navigator.clipboard) {
            sharedLinkInputElement.select() // marks text in a field or text area
            return;
        }

        navigator.clipboard.writeText(sharedLinkInputElement.value) //writes link to the clipbors. returns a promise
            .then(() => {
                alert('Copied into clipbord...')
            })
            .catch(err => {
                console.log(err)
                sharedLinkInputElement.select() // marks text in a field or text area
            })
    }

    selectPlace(coordinates, address) { //receives coordinates from function call in  modal below
        if (this.map) { // checks if there is already a map so if we get user loc 2ce in a row a new map object isnt created
            this.map.render(coordinates); //calls render method in Maps forwarding coordinates
        } else { // create a new map if one has not already been created
            this.map = new Map(coordinates); // map instace created. cordiantes received from modal. passes coordinates to Map class
        }
        this.shareBtn.disabled = false;
        const sharedLinkInputElement = document.getElementById('share-link');
        //url constucted below from address lat and lng retrieved from getAddressFromCoords google fetch in Location.js
        sharedLinkInputElement.value = `${location.origin}/my-place?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${coordinates.lng}`;
    }

    locateUserHandler() {
        if (!navigator.geolocation) {
            alert('Location feature not available in your browser - please use a more modern one or manually enter an address.');
            return;
        }

        const modal = new Modal('loading-modal-content', 'Loading Location - please wait...') // pass id of contnet and fallback text on instantiation
        modal.show() // calls show method created in Modal class 
        navigator.geolocation.getCurrentPosition( // gets current location of the user. Takes 2 argu's
        async successResult => { // code for exe on getting location
            const coordinates = {
                lat: successResult.coords.latitude, // can add + Math.random() * 50 to hide location
                lng: successResult.coords.longitude // can add + Math.random() * 50 to hide location
            };
            const address = await getAddressFromCoords(coordinates) // calls function in Location.js passes coordinates object
            modal.hide()
            this.selectPlace(coordinates, address) // forwards coordinates and address to selectPlace
      
        }, 
        error => { // fallback for failing to get location
            modal.hide()
            alert('Could not locate you. Please enter an address manually.')
        });  
    }

    async findAddressHandler(event) { // used to find out where a entered address is located
        event.preventDefault(); // prevents HTTP request / submission attempt
        const address = event.target.querySelector('input').value;
        if (!address || address.trim().length === 0) { // user input validation
           alert('Invalid address entered. Please try again!');
           return; 
        }
        const modal = new Modal('loading-modal-content', 'Loading Location - please wait...'); //instantiates modal for loadind info display
        modal.show() // call to show()
        try {
            const coordinates = await getCoordsFromAddress(address); //forwards address input by user to function inported from Location script. returns a promoise
            this.selectPlace(coordinates, address)
        } catch (err) {
            alert(err.message) // built in Error constructor function contains message property which uses the messages you put in for errors as values to display 
        }
        modal.hide()
    }   
}

const placeFinder = new PlaceFinder() // instantiates object placeFinder as an instance of PlaceFinder class 