import { Application } from 'pixi.js';

class Game {
    public app: Application;

    constructor() {
        this.app = new Application();
    }

    public async init(container: HTMLElement): Promise<void> {
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x1a1a2e,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
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