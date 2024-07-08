import { Vector3 } from "./math.js";


export class Input {
    movement = Vector3.zero;
    rotation = Vector3.zero;

    constructor() {
        /** @param {KeyboardEvent} e */
        let handleInput = (e) => {
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
        document.addEventListener('keydown', handleInput);
        document.addEventListener('keyup',   handleInput);
    }
}