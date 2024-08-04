
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
        this.currentGroup = this;
        
        this.el.className = "inspectorWindow";
        this.head.className = "inspectorWindowHead";
        this.body.className = "inspectorWindowBody";

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
        this.dragStartX = e.clientX - this.el.offsetLeft;
        this.dragStartY = e.clientY - this.el.offsetTop;
        this.isDragged = true;
    }

    onMouseUp() {
        this.isDragged = false;
    }

    onMouseMove(e) {
        if (!this.isDragged) return;
        this.el.style.left = e.clientX - this.dragStartX + 'px';
        this.el.style.top = e.clientY - this.dragStartY + 'px';
    }

    add(InspectorElement) {
        this.body.append(InspectorElement.el);
    }

    startGroup(header) {
        const group = new InspectorGroup(header);
        this.currentGroup = group;
        this.add(group);
    }

    endGroup() {
        this.currentGroup = this;
    }

    slider(header, min, max, getter, setter) {
        this.currentGroup.add(new Slider(header, min, max, getter, setter).el);
    }
}

class InspectorElement {

    constructor() {
        this.el = document.createElement('div');
        this.el.className = 'inspectorElement';
    }

}

class InspectorGroup extends InspectorElement {

    isHidden = false;

    constructor(text) {
        super();
        this.head = document.createElement('div');
        this.body = document.createElement('div');
        this.head.innerText = text;
        this.el.className = 'inspectorElementGroup';
        this.head.className = 'inspectorElementGroupHead';
        this.body.className = 'inspectorElementGroupBody';

        this.head.onclick = () => {
            this.isHidden = !this.isHidden;
            this.body.style.display = this.isHidden ? 'none' : 'block';
        }

        this.el.append(this.head, this.body);
    }

    add(...elements) {
        this.body.append(...elements);
    }

    setHeader(text) {
        this.head.innerText = text;
    }

    getHeader() {
        return this.head.innerText;
    }

    toggleVisibility() {

    }

}

class Slider extends InspectorElement {
    constructor(label, min, max, getter, setter) {
        super();
        this.getter = getter;
        this.setter = setter;
        
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.value = getter();
        this.slider.min = min;
        this.slider.max = max;
        this.slider.step = 0.01;
        this.slider.style.flex = '1';
        this.slider.addEventListener('input', () => {
            this.setter(this.slider.value);
        });

        this.label = document.createElement('span');
        this.minEl = document.createElement('span');
        this.maxEl = document.createElement('span');
        this.label.innerText = label + ": ";
        this.minEl.innerText = min;
        this.maxEl.innerText = max;

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '5px';
        container.append(this.label, this.minEl, this.slider, this.maxEl);

        this.el.append(container);
    }
}