import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../../config/GameConfig';

export class SymbolView extends Container {
    private bg: Graphics;
    private symbolText: Text;
    public readonly symbolId: number; // 1. Явно объявляем свойство здесь

    constructor(symbolId: number) { // 2. Убираем модификаторы доступа из аргументов
        super();
        this.symbolId = symbolId; // 3. Присваиваем значение
        
        const size = GameConfig.grid.symbolSize;

        this.bg = new Graphics()
            .rect(0, 0, size, size)
            .fill({ color: this.getColorById(symbolId), alpha: 0.8 });
        
        this.symbolText = new Text({
            text: symbolId.toString(),
            style: { fontFamily: 'Arial', fontSize: 36, fill: 0xffffff, fontWeight: 'bold' }
        });
        
        this.symbolText.anchor.set(0.5);
        this.symbolText.x = size / 2;
        this.symbolText.y = size / 2;

        this.addChild(this.bg, this.symbolText);
    }

    private getColorById(id: number): number {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xffffff];
        return colors[id % colors.length];
    }
}