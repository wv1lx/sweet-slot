import { Application } from 'pixi.js';

export class Game {
    public app: Application;

    constructor() {
        this.app = new Application();
    }

    public async init(container: HTMLElement) {
        await this.app.init({
            resizeTo: window,
            resolution: window.devicePixelRatio || 1, 
            autoDensity: true,                        
            backgroundColor: 0x000000,
        });
        container.appendChild(this.app.canvas);
    }

    public get width(): number {
        return this.app.screen.width;
    }

    public get height(): number {
        return this.app.screen.height;
    }
}

export const game = new Game();