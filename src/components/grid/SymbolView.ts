import { Container, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { SymbolTextureMap } from '../../core/AssetLoader';
import { GameConfig } from '../../config/GameConfig';

const SymbolScaleMap: Record<number, { x: number, y: number }> = {
    9: { x: 1.73, y: 1.0 }, 
    3: { x: 0.95, y: 1.0 }, 
    4: { x: 1.0, y: 1.0 }, 
    5: { x: 0.85, y: 1.0 }, 
    6: { x: 1.0, y: 0.85 }, 
    7: { x: 0.9, y: 0.9 },
    8: { x: 1.0, y: 0.9 },
    0: { x: 1.2, y: 1.0 },      
};

const MULTIPLIER_VALUES = [2, 3, 4, 5, 8, 10, 15, 25, 50, 100];

export class SymbolView extends Container {
    private sprite: Sprite;
    public symbolId: number;
    public multiValue: number = 0; 

    constructor(symbolId: number) {
        super();
        this.symbolId = symbolId;

        const textureName = SymbolTextureMap[symbolId];
        this.sprite = new Sprite(Texture.from(textureName));
        
        const { symbolSize } = GameConfig.grid;
        
        this.sprite.width = symbolSize;
        this.sprite.height = symbolSize;
        
        const customScale = SymbolScaleMap[symbolId] || { x: 1, y: 1 };
        this.sprite.scale.x *= customScale.x;
        this.sprite.scale.y *= customScale.y;
        
        this.sprite.anchor.set(0.5);
        this.sprite.x = symbolSize / 2;
        this.sprite.y = symbolSize / 2;

        this.addChild(this.sprite);

        // Если это сундук-множитель (ID 11), добавляем число поверх
        if (this.symbolId === GameConfig.multiplierId) {
            this.multiValue = MULTIPLIER_VALUES[Math.floor(Math.random() * MULTIPLIER_VALUES.length)];
            
            const textStyle = new TextStyle({
                fontFamily: 'Arial Black',
                fontSize: 36,
                fill: 0xffd700, // Исправлено: передаем единое число вместо массива цветов
                stroke: { color: 0x000000, width: 6 }, 
                dropShadow: {
                    alpha: 0.5,
                    blur: 4,
                    color: 0x000000,
                    distance: 2
                }
            });

            const multiText = new Text({ text: `${this.multiValue}x`, style: textStyle });
            multiText.anchor.set(0.5);
            multiText.x = symbolSize / 2;
            multiText.y = symbolSize / 2 + 15; 
            
            this.addChild(multiText);
        }
    }
}