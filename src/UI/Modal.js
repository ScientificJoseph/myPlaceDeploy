//js file for diaplaying the modal and content in it
export class Modal {
    constructor(contentId, fallbackText) { //template Id and fallback text received on instantiation in SharePlace
        this.fallbackText = fallbackText; //
        this.contentTemplateEl = document.getElementById(contentId); // access to template element loading-modal-content received from constructor parameter on modal instantiaton in SharePlace
        this.modalTemplateEl = document.getElementById('modal-template'); // access to template element modal-template 
    } 
    show() {// function to show modal
        if ('content' in document.createElement('template')) { // test to see if browser supports html templates. in keyword checks to see if element template onject has the content property
            const modalElements = document.importNode(this.modalTemplateEl.content, true);//create a node baded on template. true makes deep copy giving access to nodes decendants
            this.modalElement = modalElements.querySelector('.modal'); // access to modal element via modalElements
            this.backdropElement = modalElements.querySelector('.backdrop'); // access to backdrop element via modalElements
            const contentElement = document.importNode(this.contentTemplateEl.content, true);// access to modal content from crated node that will be displayed be displayed reflecting contentId from constructor

            this.modalElement.appendChild(contentElement) // appends content to modalElement

            document.body.insertAdjacentElement('afterbegin', this.modalElement); //iserts modal element to into DOM
            document.body.insertAdjacentElement('afterbegin', this.backdropElement)//inserts backdrop element into DOM
            
        } else {
            // fallback code for browsers that don't support the template element object
            alert(this.fallbackText);
        }
    } 

    hide() {// function to hide modal
        if(this.modalElement) {
            document.body.removeChild(this.modalElement); // *could use this.modal.Element.remove()
            document.body.removeChild(this.backdropElement)
            this.modalElement = null; //tells js properties are cleared and referenced to DOM elements no longer needed
            this.backdropElement = null; //tells js properties are cleared and referenced to DOM elements no longer needed
        }
    } 
}