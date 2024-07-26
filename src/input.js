import { Vector3 } from "./math.js";

export class Input {
    movement = Vector3.zero;
    rotation = Vector3.zero;

    constructor(initialSpeed, step) {
        this.speed = initialSpeed;
        this.step = step;

        /** @param {KeyboardEvent} e */
        let handleKeyboardInput = (e) => {
            // e.preventDefault();
            if (e.repeat) return;
            const isDown = e.type === 'keydown';
            switch (e.code) {
                case 'KeyW':
                    this.movement.z = isDown ?  1 : 0; break;
                case 'KeyS':
                    this.movement.z = isDown ? -1 : 0; break;
                case 'KeyD':
                    this.movement.x = isDown ?  1 : 0; break;
                case 'KeyA':
                    this.movement.x = isDown ? -1 : 0; break;
                case 'Space':
                    this.movement.y = isDown ?  1 : 0; break;
                case 'ShiftLeft':
                    this.movement.y = isDown ? -1 : 0; break;
                case 'ArrowDown':
                    this.rotation.x = isDown ?  1 : 0; break;
                case 'ArrowUp':
                    this.rotation.x = isDown ? -1 : 0; break;
                case 'ArrowRight':
                    this.rotation.y = isDown ?  1 : 0; break;
                case 'ArrowLeft':
                    this.rotation.y = isDown ? -1 : 0; break;
            }
        }

        /** @param {WheelEvent} e */
        let handleWheelInput = (e) => {
            this.speed += -Math.sign(e.deltaY) * this.step;
            this.speed = Math.max(0, this.speed);
        }
        document.addEventListener('keydown', handleKeyboardInput);
        document.addEventListener('keyup',   handleKeyboardInput);
        document.addEventListener('wheel', handleWheelInput);
    }
}

// TODO: Find a way to make something like this work
export class Controller {

    /**
     * @param {Input} input 
     */
    constructor(transform, input) {
        this.input = input;
    }



}