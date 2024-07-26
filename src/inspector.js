
const hideSVG  = `<svg viewBox="0 0 24 24" fill="none" width="24px" height="24px"><path d="M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
const showSVG  = `<svg viewBox="0 0 24 24" fill="none" width="24px" height="24px"><path d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
const closeSVG = `<svg viewBox="0 0 24 24" fill="none" width="24px" height="24px"><path d="M9 9L15 15M15 9L9 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`

export class InspectorWindow {

    isDragged = false;
    isHidden = false;
    dragStartX = 0;
    dragStartY = 0;

    constructor(name = '') {
        this.el = document.createElement('div');
        this.head = document.createElement('div');
        this.body = document.createElement('div');
        this.el.append(this.head, this.body);
        
        this.el.className = "inspectorWindow";
        this.head.className = "inspectorHead";
        this.body.className = "inspectorBody";

        const title = document.createElement('span');
        title.innerText = name;
        title.style.flex = '1';

        const hideButton = document.createElement('button');
        hideButton.innerHTML = hideSVG;
        hideButton.className = 'inspectorButton';
        hideButton.onmousedown = () => this.toggleVisibility(hideButton);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = closeSVG;
        closeButton.className = 'inspectorButton';
        // todo: change this to actually close and add another window for opening new windows
        closeButton.onmousedown = () => this.toggleVisibility(hideButton);

        this.head.append(title, hideButton, closeButton);

        this.head.onmousedown = (e) => this.onMouseDown(e);
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        document.body.prepend(this.el);
    }

    toggleVisibility(button) {
        this.isHidden = !this.isHidden;
        this.body.style.display = this.isHidden ? 'none' : 'block';
        button.innerHTML = this.isHidden ? showSVG : hideSVG;
    }

    onMouseDown(e) {
        this.head.style.cursor = 'grabbing';
        this.dragStartX = e.clientX - this.el.offsetLeft;
        this.dragStartY = e.clientY - this.el.offsetTop;
        this.isDragged = true;
    }

    onMouseUp() {
        this.head.style.cursor = 'grab';
        this.isDragged = false;
    }

    onMouseMove(e) {
        if (!this.isDragged) return;
        this.el.style.left = e.clientX - this.dragStartX + 'px';
        this.el.style.top = e.clientY - this.dragStartY + 'px';
    }

    slider(header, value, min, max) {
        this.body.append(new Slider(header, value, min, max).el);
    }
}

class InspectorElement {

    isHidden = false;

    constructor(header) {
        this.el = document.createElement('div');
        this.head = document.createElement('div');
        this.body = document.createElement('div');
        this.el.append(this.head, this.body);

        this.el.className = 'inspectorElement';
        this.head.className = 'inspectorElementHead';
        this.body.className = 'inspectorElementBody';

        this.head.innerText = header;
        
        this.head.onclick = () => this.toggleVisibility();
    }

    toggleVisibility() {
        this.isHidden = !this.isHidden;
        this.body.style.display = this.isHidden ? 'none' : 'block';
    }

}

class Slider extends InspectorElement {
    constructor(header, value, min, max) {
        super(header);
        this.value = value;
        this.min = min;
        this.max = max;
        
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.value = value;
        this.slider.min = min;
        this.slider.max = max;
        this.slider.style.flex = '1';

        this.minEl = document.createElement('span');
        this.maxEl = document.createElement('span');
        this.minEl.innerText = this.min;
        this.maxEl.innerText = this.max;

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.append(this.min, this.slider, this.max);

        this.body.append(container);
    }
}