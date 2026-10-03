import { Container, Graphics, Text } from 'pixi.js';

export class SpinButton extends Container {
    private bg: Graphics;
    private buttonText: Text;

    constructor() {
        super();

        // Рисуем прямоугольник со скругленными углами
        this.bg = new Graphics()
            .roundRect(0, 0, 200, 80, 15)
            .fill({ color: 0xff0055 }); // Ярко-розовый цвет

        this.buttonText = new Text({
            text: 'SPIN',
            style: { fontFamily: 'Arial', fontSize: 36, fill: 0xffffff, fontWeight: 'bold' }
        });

        // Центрируем текст внутри кнопки
        this.buttonText.anchor.set(0.5);
        this.buttonText.x = 100;
        this.buttonText.y = 40;

        this.addChild(this.bg, this.buttonText);

        // Делаем кнопку интерактивной
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // Визуальный отклик на нажатие (уменьшаем прозрачность)
        this.on('pointerdown', () => this.alpha = 0.7);
        this.on('pointerup', () => this.alpha = 1);
        this.on('pointerupoutside', () => this.alpha = 1);
    }

    // Метод для назначения действия на клик
    public setAction(callback: () => void): void {
        this.on('pointertap', callback);
    }
}