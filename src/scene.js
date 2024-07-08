import { GameObject } from "./gameObject.js";

export class Scene extends GameObject {

    constructor(...children) {
        super();
        this.add(...children);
    }

}