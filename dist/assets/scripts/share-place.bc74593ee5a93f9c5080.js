(function(){"use strict";var __webpack_modules__={9441:function(){eval("\n;// CONCATENATED MODULE: ./src/UI/Modal.js\n//js file for diaplaying the modal and content in it\nclass Modal {\n  constructor(contentId, fallbackText) {\n    //template Id and fallback text received on instantiation in SharePlace\n    this.fallbackText = fallbackText; //\n    this.contentTemplateEl = document.getElementById(contentId); // access to template element loading-modal-content received from constructor parameter on modal instantiaton in SharePlace\n    this.modalTemplateEl = document.getElementById('modal-template'); // access to template element modal-template \n  }\n\n  show() {\n    // function to show modal\n    if ('content' in document.createElement('template')) {\n      // test to see if browser supports html templates. in keyword checks to see if element template onject has the content property\n      const modalElements = document.importNode(this.modalTemplateEl.content, true); //create a node baded on template. true makes deep copy giving access to nodes decendants\n      this.modalElement = modalElements.querySelector('.modal'); // access to modal element via modalElements\n      this.backdropElement = modalElements.querySelector('.backdrop'); // access to backdrop element via modalElements\n      const contentElement = document.importNode(this.contentTemplateEl.content, true); // access to modal content from crated node that will be displayed be displayed reflecting contentId from constructor\n\n      this.modalElement.appendChild(contentElement); // appends content to modalElement\n\n      document.body.insertAdjacentElement('afterbegin', this.modalElement); //iserts modal element to into DOM\n      document.body.insertAdjacentElement('afterbegin', this.backdropElement); //inserts backdrop element into DOM\n    } else {\n      // fallback code for browsers that don't support the template element object\n      alert(this.fallbackText);\n    }\n  }\n  hide() {\n    // function to hide modal\n    if (this.modalElement) {\n      document.body.removeChild(this.modalElement); // *could use this.modal.Element.remove()\n      document.body.removeChild(this.backdropElement);\n      this.modalElement = null; //tells js properties are cleared and referenced to DOM elements no longer needed\n      this.backdropElement = null; //tells js properties are cleared and referenced to DOM elements no longer needed\n    }\n  }\n}\n;// CONCATENATED MODULE: ./src/UI/Map.js\nclass Map {\n  constructor(coords) {\n    // received on instantiation in shareplace selectPlace function \n    // this.coordinates = coords;\n    this.render(coords);\n  }\n  render(coordinates) {\n    // recives coordinates from function call in selectPlace() funtion call in SharePlace class \n    if (!google) {\n      alert('Could not load maps library - please try again later...');\n      return;\n    }\n    const map = new google.maps.Map(document.getElementById('map'), {\n      // constructor() provided by google maps. gets paseed eleemt id to render map to\n      center: coordinates,\n      // object prop. coords recieved from constuctor\n      zoom: 16\n    });\n    new google.maps.Marker({\n      // adds pin to map\n      position: coordinates,\n      map: map // ties Marker to map instantiated above\n    });\n  }\n}\n;// CONCATENATED MODULE: ./src/Utility/Location.js\n//created to reach out to google servers for API to translate the user input into coordinates\n\nconst GOOGLE_API_KEY = 'AIzaSyDwMA8t7jIonhwGmdWZBzjdAG68P_p9_PQ';\nasync function getAddressFromCoords(coords) {\n  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${GOOGLE_API_KEY}`);\n  if (!response.ok) {\n    throw new Error('Failed to fetch address. Please try again...'); // Error is a globally available constructor() in JS\n  }\n\n  const data = await response.json();\n  if (data.error_message) {\n    // checks for errors that could occur with google even in the presence a 200 staus code\n    throw new Error(data.error_message); // error_message is a property in the response body\n  }\n\n  const address = data.results[0].formatted_address; // //results is a Maps API array whos first element is an object with a formated address property with a value that renders the adddress in the format desired here\n  return address;\n}\nasync function getCoordsFromAddress(address) {\n  const urlAdress = encodeURI(address); //made available by the browser api. encodes urls so they can be sent to the server.\n  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${urlAdress}&key=${GOOGLE_API_KEY}`);\n  if (!response.ok) {\n    throw new Error('Failed to fetch coordinates. Please try again...'); // Error is a globally available constructor() in JS\n  }\n\n  const data = await response.json();\n  if (data.error_message) {\n    // checks for errors that could occur with google even in the presence a 200 staus code\n    throw new Error(data.error_message); // error_message is a property in the response body\n  }\n\n  const coordinates = data.results[0].geometry.location; //results is a Maps API array whos first element is an object with a geometry property object with a location property\n  return coordinates;\n}\n;// CONCATENATED MODULE: ./src/SharePlace.js\n\n\n\nclass PlaceFinder {\n  constructor() {\n    const addressForm = document.querySelector('form');\n    const locateUserBtn = document.getElementById('locate-btn');\n    this.shareBtn = document.getElementById('share-btn');\n    locateUserBtn.addEventListener('click', this.locateUserHandler.bind(this)); // binds button this to Class instead of button\n    this.shareBtn.addEventListener('click', this.sharePlaceHandler);\n    addressForm.addEventListener('submit', this.findAddressHandler.bind(this));\n  }\n  sharePlaceHandler() {\n    const sharedLinkInputElement = document.getElementById('share-link');\n    if (!navigator.clipboard) {\n      sharedLinkInputElement.select(); // marks text in a field or text area\n      return;\n    }\n    navigator.clipboard.writeText(sharedLinkInputElement.value) //writes link to the clipbors. returns a promise\n    .then(() => {\n      alert('Copied into clipbord...');\n    }).catch(err => {\n      console.log(err);\n      sharedLinkInputElement.select(); // marks text in a field or text area\n    });\n  }\n\n  selectPlace(coordinates, address) {\n    //receives coordinates from function call in  modal below\n    if (this.map) {\n      // checks if there is already a map so if we get user loc 2ce in a row a new map object isnt created\n      this.map.render(coordinates); //calls render method in Maps forwarding coordinates\n    } else {\n      // create a new map if one has not already been created\n      this.map = new Map(coordinates); // map instace created. cordiantes received from modal. passes coordinates to Map class\n    }\n\n    this.shareBtn.disabled = false;\n    const sharedLinkInputElement = document.getElementById('share-link');\n    //url constucted below from address lat and lng retrieved from getAddressFromCoords google fetch in Location.js\n    sharedLinkInputElement.value = `${location.origin}/my-place?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${coordinates.lng}`;\n  }\n  locateUserHandler() {\n    if (!navigator.geolocation) {\n      alert('Location feature not available in your browser - please use a more modern one or manually enter an address.');\n      return;\n    }\n    const modal = new Modal('loading-modal-content', 'Loading Location - please wait...'); // pass id of contnet and fallback text on instantiation\n    modal.show(); // calls show method created in Modal class \n    navigator.geolocation.getCurrentPosition(\n    // gets current location of the user. Takes 2 argu's\n    async successResult => {\n      // code for exe on getting location\n      const coordinates = {\n        lat: successResult.coords.latitude,\n        // can add + Math.random() * 50 to hide location\n        lng: successResult.coords.longitude // can add + Math.random() * 50 to hide location\n      };\n\n      const address = await getAddressFromCoords(coordinates); // calls function in Location.js passes coordinates object\n      modal.hide();\n      this.selectPlace(coordinates, address); // forwards coordinates and address to selectPlace\n    }, error => {\n      // fallback for failing to get location\n      modal.hide();\n      alert('Could not locate you. Please enter an address manually.');\n    });\n  }\n  async findAddressHandler(event) {\n    // used to find out where a entered address is located\n    event.preventDefault(); // prevents HTTP request / submission attempt\n    const address = event.target.querySelector('input').value;\n    if (!address || address.trim().length === 0) {\n      // user input validation\n      alert('Invalid address entered. Please try again!');\n      return;\n    }\n    const modal = new Modal('loading-modal-content', 'Loading Location - please wait...'); //instantiates modal for loadind info display\n    modal.show(); // call to show()\n    try {\n      const coordinates = await getCoordsFromAddress(address); //forwards address input by user to function inported from Location script. returns a promoise\n      this.selectPlace(coordinates, address);\n    } catch (err) {\n      alert(err.message); // built in Error constructor function contains message property which uses the messages you put in for errors as values to display \n    }\n\n    modal.hide();\n  }\n}\nconst placeFinder = new PlaceFinder(); // instantiates object placeFinder as an instance of PlaceFinder class//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiOTQ0MS5qcyIsIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0E7QUFBQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7O0FBRUE7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBOztBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUFBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL215LXBsYWNlLy4vc3JjL1VJL01vZGFsLmpzPzI3MDIiLCJ3ZWJwYWNrOi8vbXktcGxhY2UvLi9zcmMvVUkvTWFwLmpzP2I1NzkiLCJ3ZWJwYWNrOi8vbXktcGxhY2UvLi9zcmMvVXRpbGl0eS9Mb2NhdGlvbi5qcz80MmRlIiwid2VicGFjazovL215LXBsYWNlLy4vc3JjL1NoYXJlUGxhY2UuanM/ZDVhNyJdLCJzb3VyY2VzQ29udGVudCI6WyIvL2pzIGZpbGUgZm9yIGRpYXBsYXlpbmcgdGhlIG1vZGFsIGFuZCBjb250ZW50IGluIGl0XHJcbmV4cG9ydCBjbGFzcyBNb2RhbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb250ZW50SWQsIGZhbGxiYWNrVGV4dCkgeyAvL3RlbXBsYXRlIElkIGFuZCBmYWxsYmFjayB0ZXh0IHJlY2VpdmVkIG9uIGluc3RhbnRpYXRpb24gaW4gU2hhcmVQbGFjZVxyXG4gICAgICAgIHRoaXMuZmFsbGJhY2tUZXh0ID0gZmFsbGJhY2tUZXh0OyAvL1xyXG4gICAgICAgIHRoaXMuY29udGVudFRlbXBsYXRlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250ZW50SWQpOyAvLyBhY2Nlc3MgdG8gdGVtcGxhdGUgZWxlbWVudCBsb2FkaW5nLW1vZGFsLWNvbnRlbnQgcmVjZWl2ZWQgZnJvbSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgb24gbW9kYWwgaW5zdGFudGlhdG9uIGluIFNoYXJlUGxhY2VcclxuICAgICAgICB0aGlzLm1vZGFsVGVtcGxhdGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC10ZW1wbGF0ZScpOyAvLyBhY2Nlc3MgdG8gdGVtcGxhdGUgZWxlbWVudCBtb2RhbC10ZW1wbGF0ZSBcclxuICAgIH0gXHJcbiAgICBzaG93KCkgey8vIGZ1bmN0aW9uIHRvIHNob3cgbW9kYWxcclxuICAgICAgICBpZiAoJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpIHsgLy8gdGVzdCB0byBzZWUgaWYgYnJvd3NlciBzdXBwb3J0cyBodG1sIHRlbXBsYXRlcy4gaW4ga2V5d29yZCBjaGVja3MgdG8gc2VlIGlmIGVsZW1lbnQgdGVtcGxhdGUgb25qZWN0IGhhcyB0aGUgY29udGVudCBwcm9wZXJ0eVxyXG4gICAgICAgICAgICBjb25zdCBtb2RhbEVsZW1lbnRzID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0aGlzLm1vZGFsVGVtcGxhdGVFbC5jb250ZW50LCB0cnVlKTsvL2NyZWF0ZSBhIG5vZGUgYmFkZWQgb24gdGVtcGxhdGUuIHRydWUgbWFrZXMgZGVlcCBjb3B5IGdpdmluZyBhY2Nlc3MgdG8gbm9kZXMgZGVjZW5kYW50c1xyXG4gICAgICAgICAgICB0aGlzLm1vZGFsRWxlbWVudCA9IG1vZGFsRWxlbWVudHMucXVlcnlTZWxlY3RvcignLm1vZGFsJyk7IC8vIGFjY2VzcyB0byBtb2RhbCBlbGVtZW50IHZpYSBtb2RhbEVsZW1lbnRzXHJcbiAgICAgICAgICAgIHRoaXMuYmFja2Ryb3BFbGVtZW50ID0gbW9kYWxFbGVtZW50cy5xdWVyeVNlbGVjdG9yKCcuYmFja2Ryb3AnKTsgLy8gYWNjZXNzIHRvIGJhY2tkcm9wIGVsZW1lbnQgdmlhIG1vZGFsRWxlbWVudHNcclxuICAgICAgICAgICAgY29uc3QgY29udGVudEVsZW1lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMuY29udGVudFRlbXBsYXRlRWwuY29udGVudCwgdHJ1ZSk7Ly8gYWNjZXNzIHRvIG1vZGFsIGNvbnRlbnQgZnJvbSBjcmF0ZWQgbm9kZSB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGJlIGRpc3BsYXllZCByZWZsZWN0aW5nIGNvbnRlbnRJZCBmcm9tIGNvbnN0cnVjdG9yXHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGFsRWxlbWVudC5hcHBlbmRDaGlsZChjb250ZW50RWxlbWVudCkgLy8gYXBwZW5kcyBjb250ZW50IHRvIG1vZGFsRWxlbWVudFxyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyYmVnaW4nLCB0aGlzLm1vZGFsRWxlbWVudCk7IC8vaXNlcnRzIG1vZGFsIGVsZW1lbnQgdG8gaW50byBET01cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyYmVnaW4nLCB0aGlzLmJhY2tkcm9wRWxlbWVudCkvL2luc2VydHMgYmFja2Ryb3AgZWxlbWVudCBpbnRvIERPTVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBmYWxsYmFjayBjb2RlIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgdGhlIHRlbXBsYXRlIGVsZW1lbnQgb2JqZWN0XHJcbiAgICAgICAgICAgIGFsZXJ0KHRoaXMuZmFsbGJhY2tUZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9IFxyXG5cclxuICAgIGhpZGUoKSB7Ly8gZnVuY3Rpb24gdG8gaGlkZSBtb2RhbFxyXG4gICAgICAgIGlmKHRoaXMubW9kYWxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGhpcy5tb2RhbEVsZW1lbnQpOyAvLyAqY291bGQgdXNlIHRoaXMubW9kYWwuRWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuYmFja2Ryb3BFbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLm1vZGFsRWxlbWVudCA9IG51bGw7IC8vdGVsbHMganMgcHJvcGVydGllcyBhcmUgY2xlYXJlZCBhbmQgcmVmZXJlbmNlZCB0byBET00gZWxlbWVudHMgbm8gbG9uZ2VyIG5lZWRlZFxyXG4gICAgICAgICAgICB0aGlzLmJhY2tkcm9wRWxlbWVudCA9IG51bGw7IC8vdGVsbHMganMgcHJvcGVydGllcyBhcmUgY2xlYXJlZCBhbmQgcmVmZXJlbmNlZCB0byBET00gZWxlbWVudHMgbm8gbG9uZ2VyIG5lZWRlZFxyXG4gICAgICAgIH1cclxuICAgIH0gXHJcbn0iLCJleHBvcnQgY2xhc3MgTWFwIHtcclxuICAgIGNvbnN0cnVjdG9yKGNvb3JkcykgeyAvLyByZWNlaXZlZCBvbiBpbnN0YW50aWF0aW9uIGluIHNoYXJlcGxhY2Ugc2VsZWN0UGxhY2UgZnVuY3Rpb24gXHJcbiAgICAgICAgLy8gdGhpcy5jb29yZGluYXRlcyA9IGNvb3JkcztcclxuICAgICAgICB0aGlzLnJlbmRlcihjb29yZHMpOyBcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoY29vcmRpbmF0ZXMpIHsgIC8vIHJlY2l2ZXMgY29vcmRpbmF0ZXMgZnJvbSBmdW5jdGlvbiBjYWxsIGluIHNlbGVjdFBsYWNlKCkgZnVudGlvbiBjYWxsIGluIFNoYXJlUGxhY2UgY2xhc3MgXHJcbiAgICAgICAgaWYgKCFnb29nbGUpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ0NvdWxkIG5vdCBsb2FkIG1hcHMgbGlicmFyeSAtIHBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIHsgLy8gY29uc3RydWN0b3IoKSBwcm92aWRlZCBieSBnb29nbGUgbWFwcy4gZ2V0cyBwYXNlZWQgZWxlZW10IGlkIHRvIHJlbmRlciBtYXAgdG9cclxuICAgICAgICAgICAgY2VudGVyOiBjb29yZGluYXRlcywgLy8gb2JqZWN0IHByb3AuIGNvb3JkcyByZWNpZXZlZCBmcm9tIGNvbnN0dWN0b3JcclxuICAgICAgICAgICAgem9vbTogMTZcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7IC8vIGFkZHMgcGluIHRvIG1hcFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogY29vcmRpbmF0ZXMsXHJcbiAgICAgICAgICAgIG1hcDogbWFwIC8vIHRpZXMgTWFya2VyIHRvIG1hcCBpbnN0YW50aWF0ZWQgYWJvdmVcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8vY3JlYXRlZCB0byByZWFjaCBvdXQgdG8gZ29vZ2xlIHNlcnZlcnMgZm9yIEFQSSB0byB0cmFuc2xhdGUgdGhlIHVzZXIgaW5wdXQgaW50byBjb29yZGluYXRlc1xyXG5cclxuY29uc3QgR09PR0xFX0FQSV9LRVkgPSAnQUl6YVN5RHdNQTh0N2pJb25od0dtZFdaQnpqZEFHNjhQX3A5X1BRJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBZGRyZXNzRnJvbUNvb3Jkcyhjb29yZHMpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9nZW9jb2RlL2pzb24/bGF0bG5nPSR7Y29vcmRzLmxhdH0sJHtjb29yZHMubG5nfSZrZXk9JHtHT09HTEVfQVBJX0tFWX1gKTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggYWRkcmVzcy4gUGxlYXNlIHRyeSBhZ2Fpbi4uLicpOyAvLyBFcnJvciBpcyBhIGdsb2JhbGx5IGF2YWlsYWJsZSBjb25zdHJ1Y3RvcigpIGluIEpTXHJcbiAgICB9XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgaWYgKGRhdGEuZXJyb3JfbWVzc2FnZSkgeyAvLyBjaGVja3MgZm9yIGVycm9ycyB0aGF0IGNvdWxkIG9jY3VyIHdpdGggZ29vZ2xlIGV2ZW4gaW4gdGhlIHByZXNlbmNlIGEgMjAwIHN0YXVzIGNvZGVcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvcl9tZXNzYWdlKTsgLy8gZXJyb3JfbWVzc2FnZSBpcyBhIHByb3BlcnR5IGluIHRoZSByZXNwb25zZSBib2R5XHJcbiAgICB9XHJcbiAgICBjb25zdCBhZGRyZXNzID0gZGF0YS5yZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzOyAvLyAvL3Jlc3VsdHMgaXMgYSBNYXBzIEFQSSBhcnJheSB3aG9zIGZpcnN0IGVsZW1lbnQgaXMgYW4gb2JqZWN0IHdpdGggYSBmb3JtYXRlZCBhZGRyZXNzIHByb3BlcnR5IHdpdGggYSB2YWx1ZSB0aGF0IHJlbmRlcnMgdGhlIGFkZGRyZXNzIGluIHRoZSBmb3JtYXQgZGVzaXJlZCBoZXJlXHJcbiAgICByZXR1cm4gYWRkcmVzcztcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvb3Jkc0Zyb21BZGRyZXNzKGFkZHJlc3MpIHtcclxuICAgIGNvbnN0IHVybEFkcmVzcyA9IGVuY29kZVVSSShhZGRyZXNzKTsgLy9tYWRlIGF2YWlsYWJsZSBieSB0aGUgYnJvd3NlciBhcGkuIGVuY29kZXMgdXJscyBzbyB0aGV5IGNhbiBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGBodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvZ2VvY29kZS9qc29uP2FkZHJlc3M9JHt1cmxBZHJlc3N9JmtleT0ke0dPT0dMRV9BUElfS0VZfWApO1xyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIGNvb3JkaW5hdGVzLiBQbGVhc2UgdHJ5IGFnYWluLi4uJykgLy8gRXJyb3IgaXMgYSBnbG9iYWxseSBhdmFpbGFibGUgY29uc3RydWN0b3IoKSBpbiBKU1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgaWYgKGRhdGEuZXJyb3JfbWVzc2FnZSkgeyAvLyBjaGVja3MgZm9yIGVycm9ycyB0aGF0IGNvdWxkIG9jY3VyIHdpdGggZ29vZ2xlIGV2ZW4gaW4gdGhlIHByZXNlbmNlIGEgMjAwIHN0YXVzIGNvZGVcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvcl9tZXNzYWdlKSAvLyBlcnJvcl9tZXNzYWdlIGlzIGEgcHJvcGVydHkgaW4gdGhlIHJlc3BvbnNlIGJvZHlcclxuICAgIH1cclxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gZGF0YS5yZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uOyAvL3Jlc3VsdHMgaXMgYSBNYXBzIEFQSSBhcnJheSB3aG9zIGZpcnN0IGVsZW1lbnQgaXMgYW4gb2JqZWN0IHdpdGggYSBnZW9tZXRyeSBwcm9wZXJ0eSBvYmplY3Qgd2l0aCBhIGxvY2F0aW9uIHByb3BlcnR5XHJcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbn1cclxuIiwiaW1wb3J0IHsgTW9kYWwgfSBmcm9tICcuL1VJL01vZGFsJ1xyXG5pbXBvcnQgeyBNYXAgfSBmcm9tICcuL1VJL01hcCc7XHJcbmltcG9ydCB7Z2V0Q29vcmRzRnJvbUFkZHJlc3MsIGdldEFkZHJlc3NGcm9tQ29vcmRzfSBmcm9tICcuL1V0aWxpdHkvTG9jYXRpb24nXHJcblxyXG5jbGFzcyBQbGFjZUZpbmRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBjb25zdCBhZGRyZXNzRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcclxuICAgICAgICBjb25zdCBsb2NhdGVVc2VyQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvY2F0ZS1idG4nKTtcclxuICAgICAgICB0aGlzLnNoYXJlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYXJlLWJ0bicpXHJcblxyXG4gICAgICAgIGxvY2F0ZVVzZXJCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmxvY2F0ZVVzZXJIYW5kbGVyLmJpbmQodGhpcykpOyAvLyBiaW5kcyBidXR0b24gdGhpcyB0byBDbGFzcyBpbnN0ZWFkIG9mIGJ1dHRvblxyXG4gICAgICAgIHRoaXMuc2hhcmVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNoYXJlUGxhY2VIYW5kbGVyKVxyXG4gICAgICAgIGFkZHJlc3NGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIHRoaXMuZmluZEFkZHJlc3NIYW5kbGVyLmJpbmQodGhpcykpXHJcbiAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHNoYXJlUGxhY2VIYW5kbGVyKCkge1xyXG4gICAgICAgIGNvbnN0IHNoYXJlZExpbmtJbnB1dEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hhcmUtbGluaycpO1xyXG4gICAgICAgIGlmICghbmF2aWdhdG9yLmNsaXBib2FyZCkge1xyXG4gICAgICAgICAgICBzaGFyZWRMaW5rSW5wdXRFbGVtZW50LnNlbGVjdCgpIC8vIG1hcmtzIHRleHQgaW4gYSBmaWVsZCBvciB0ZXh0IGFyZWFcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc2hhcmVkTGlua0lucHV0RWxlbWVudC52YWx1ZSkgLy93cml0ZXMgbGluayB0byB0aGUgY2xpcGJvcnMuIHJldHVybnMgYSBwcm9taXNlXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdDb3BpZWQgaW50byBjbGlwYm9yZC4uLicpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxyXG4gICAgICAgICAgICAgICAgc2hhcmVkTGlua0lucHV0RWxlbWVudC5zZWxlY3QoKSAvLyBtYXJrcyB0ZXh0IGluIGEgZmllbGQgb3IgdGV4dCBhcmVhXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0UGxhY2UoY29vcmRpbmF0ZXMsIGFkZHJlc3MpIHsgLy9yZWNlaXZlcyBjb29yZGluYXRlcyBmcm9tIGZ1bmN0aW9uIGNhbGwgaW4gIG1vZGFsIGJlbG93XHJcbiAgICAgICAgaWYgKHRoaXMubWFwKSB7IC8vIGNoZWNrcyBpZiB0aGVyZSBpcyBhbHJlYWR5IGEgbWFwIHNvIGlmIHdlIGdldCB1c2VyIGxvYyAyY2UgaW4gYSByb3cgYSBuZXcgbWFwIG9iamVjdCBpc250IGNyZWF0ZWRcclxuICAgICAgICAgICAgdGhpcy5tYXAucmVuZGVyKGNvb3JkaW5hdGVzKTsgLy9jYWxscyByZW5kZXIgbWV0aG9kIGluIE1hcHMgZm9yd2FyZGluZyBjb29yZGluYXRlc1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIGNyZWF0ZSBhIG5ldyBtYXAgaWYgb25lIGhhcyBub3QgYWxyZWFkeSBiZWVuIGNyZWF0ZWRcclxuICAgICAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKGNvb3JkaW5hdGVzKTsgLy8gbWFwIGluc3RhY2UgY3JlYXRlZC4gY29yZGlhbnRlcyByZWNlaXZlZCBmcm9tIG1vZGFsLiBwYXNzZXMgY29vcmRpbmF0ZXMgdG8gTWFwIGNsYXNzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hhcmVCdG4uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBzaGFyZWRMaW5rSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYXJlLWxpbmsnKTtcclxuICAgICAgICAvL3VybCBjb25zdHVjdGVkIGJlbG93IGZyb20gYWRkcmVzcyBsYXQgYW5kIGxuZyByZXRyaWV2ZWQgZnJvbSBnZXRBZGRyZXNzRnJvbUNvb3JkcyBnb29nbGUgZmV0Y2ggaW4gTG9jYXRpb24uanNcclxuICAgICAgICBzaGFyZWRMaW5rSW5wdXRFbGVtZW50LnZhbHVlID0gYCR7bG9jYXRpb24ub3JpZ2lufS9teS1wbGFjZT9hZGRyZXNzPSR7ZW5jb2RlVVJJKGFkZHJlc3MpfSZsYXQ9JHtjb29yZGluYXRlcy5sYXR9JmxuZz0ke2Nvb3JkaW5hdGVzLmxuZ31gO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2F0ZVVzZXJIYW5kbGVyKCkge1xyXG4gICAgICAgIGlmICghbmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdMb2NhdGlvbiBmZWF0dXJlIG5vdCBhdmFpbGFibGUgaW4geW91ciBicm93c2VyIC0gcGxlYXNlIHVzZSBhIG1vcmUgbW9kZXJuIG9uZSBvciBtYW51YWxseSBlbnRlciBhbiBhZGRyZXNzLicpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBtb2RhbCA9IG5ldyBNb2RhbCgnbG9hZGluZy1tb2RhbC1jb250ZW50JywgJ0xvYWRpbmcgTG9jYXRpb24gLSBwbGVhc2Ugd2FpdC4uLicpIC8vIHBhc3MgaWQgb2YgY29udG5ldCBhbmQgZmFsbGJhY2sgdGV4dCBvbiBpbnN0YW50aWF0aW9uXHJcbiAgICAgICAgbW9kYWwuc2hvdygpIC8vIGNhbGxzIHNob3cgbWV0aG9kIGNyZWF0ZWQgaW4gTW9kYWwgY2xhc3MgXHJcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbiggLy8gZ2V0cyBjdXJyZW50IGxvY2F0aW9uIG9mIHRoZSB1c2VyLiBUYWtlcyAyIGFyZ3Unc1xyXG4gICAgICAgIGFzeW5jIHN1Y2Nlc3NSZXN1bHQgPT4geyAvLyBjb2RlIGZvciBleGUgb24gZ2V0dGluZyBsb2NhdGlvblxyXG4gICAgICAgICAgICBjb25zdCBjb29yZGluYXRlcyA9IHtcclxuICAgICAgICAgICAgICAgIGxhdDogc3VjY2Vzc1Jlc3VsdC5jb29yZHMubGF0aXR1ZGUsIC8vIGNhbiBhZGQgKyBNYXRoLnJhbmRvbSgpICogNTAgdG8gaGlkZSBsb2NhdGlvblxyXG4gICAgICAgICAgICAgICAgbG5nOiBzdWNjZXNzUmVzdWx0LmNvb3Jkcy5sb25naXR1ZGUgLy8gY2FuIGFkZCArIE1hdGgucmFuZG9tKCkgKiA1MCB0byBoaWRlIGxvY2F0aW9uXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhd2FpdCBnZXRBZGRyZXNzRnJvbUNvb3Jkcyhjb29yZGluYXRlcykgLy8gY2FsbHMgZnVuY3Rpb24gaW4gTG9jYXRpb24uanMgcGFzc2VzIGNvb3JkaW5hdGVzIG9iamVjdFxyXG4gICAgICAgICAgICBtb2RhbC5oaWRlKClcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RQbGFjZShjb29yZGluYXRlcywgYWRkcmVzcykgLy8gZm9yd2FyZHMgY29vcmRpbmF0ZXMgYW5kIGFkZHJlc3MgdG8gc2VsZWN0UGxhY2VcclxuICAgICAgXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAgZXJyb3IgPT4geyAvLyBmYWxsYmFjayBmb3IgZmFpbGluZyB0byBnZXQgbG9jYXRpb25cclxuICAgICAgICAgICAgbW9kYWwuaGlkZSgpXHJcbiAgICAgICAgICAgIGFsZXJ0KCdDb3VsZCBub3QgbG9jYXRlIHlvdS4gUGxlYXNlIGVudGVyIGFuIGFkZHJlc3MgbWFudWFsbHkuJylcclxuICAgICAgICB9KTsgIFxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZpbmRBZGRyZXNzSGFuZGxlcihldmVudCkgeyAvLyB1c2VkIHRvIGZpbmQgb3V0IHdoZXJlIGEgZW50ZXJlZCBhZGRyZXNzIGlzIGxvY2F0ZWRcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyBwcmV2ZW50cyBIVFRQIHJlcXVlc3QgLyBzdWJtaXNzaW9uIGF0dGVtcHRcclxuICAgICAgICBjb25zdCBhZGRyZXNzID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWU7XHJcbiAgICAgICAgaWYgKCFhZGRyZXNzIHx8IGFkZHJlc3MudHJpbSgpLmxlbmd0aCA9PT0gMCkgeyAvLyB1c2VyIGlucHV0IHZhbGlkYXRpb25cclxuICAgICAgICAgICBhbGVydCgnSW52YWxpZCBhZGRyZXNzIGVudGVyZWQuIFBsZWFzZSB0cnkgYWdhaW4hJyk7XHJcbiAgICAgICAgICAgcmV0dXJuOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbW9kYWwgPSBuZXcgTW9kYWwoJ2xvYWRpbmctbW9kYWwtY29udGVudCcsICdMb2FkaW5nIExvY2F0aW9uIC0gcGxlYXNlIHdhaXQuLi4nKTsgLy9pbnN0YW50aWF0ZXMgbW9kYWwgZm9yIGxvYWRpbmQgaW5mbyBkaXNwbGF5XHJcbiAgICAgICAgbW9kYWwuc2hvdygpIC8vIGNhbGwgdG8gc2hvdygpXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBhd2FpdCBnZXRDb29yZHNGcm9tQWRkcmVzcyhhZGRyZXNzKTsgLy9mb3J3YXJkcyBhZGRyZXNzIGlucHV0IGJ5IHVzZXIgdG8gZnVuY3Rpb24gaW5wb3J0ZWQgZnJvbSBMb2NhdGlvbiBzY3JpcHQuIHJldHVybnMgYSBwcm9tb2lzZVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBsYWNlKGNvb3JkaW5hdGVzLCBhZGRyZXNzKVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBhbGVydChlcnIubWVzc2FnZSkgLy8gYnVpbHQgaW4gRXJyb3IgY29uc3RydWN0b3IgZnVuY3Rpb24gY29udGFpbnMgbWVzc2FnZSBwcm9wZXJ0eSB3aGljaCB1c2VzIHRoZSBtZXNzYWdlcyB5b3UgcHV0IGluIGZvciBlcnJvcnMgYXMgdmFsdWVzIHRvIGRpc3BsYXkgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1vZGFsLmhpZGUoKVxyXG4gICAgfSAgIFxyXG59XHJcblxyXG5jb25zdCBwbGFjZUZpbmRlciA9IG5ldyBQbGFjZUZpbmRlcigpIC8vIGluc3RhbnRpYXRlcyBvYmplY3QgcGxhY2VGaW5kZXIgYXMgYW4gaW5zdGFuY2Ugb2YgUGxhY2VGaW5kZXIgY2xhc3MgIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///9441\n")}},__webpack_exports__={};__webpack_modules__[9441]()})();