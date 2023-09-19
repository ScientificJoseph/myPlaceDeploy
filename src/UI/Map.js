export class Map {
    constructor(coords) { // received on instantiation in shareplace selectPlace function 
        // this.coordinates = coords;
        this.render(coords); 
    }

    render(coordinates) {  // recives coordinates from function call in selectPlace() funtion call in SharePlace class 
        if (!google) {
            alert('Could not load maps library - please try again later...');
            return;
        }

        const map = new google.maps.Map(document.getElementById('map'), { // constructor() provided by google maps. gets paseed eleemt id to render map to
            center: coordinates, // object prop. coords recieved from constuctor
            zoom: 16
        });

        new google.maps.Marker({ // adds pin to map
            position: coordinates,
            map: map // ties Marker to map instantiated above
        });
    }
}