import { Container, Sprite, Texture } from 'pixi.js';
import { SymbolTextureMap } from '../../core/AssetLoader';
import { GameConfig } from '../../config/GameConfig';

// Индивидуальные настройки масштаба для каждого символа по осям { x, y }
const SymbolScaleMap: Record<number, { x: number, y: number }> = {
    9: { x: 1.73, y: 1.0 }, // Синяя рыба: увеличить по X
    3: { x: 0.95, y: 1.0 }, // jellyfish
    4: { x: 1.0, y: 1.0 }, // Черепаха: увеличить по X
    5: { x: 0.95, y: 1.0 }, // Морской конек: уменьшить по Y
    6: { x: 1.0, y: 0.85 }, // Краб: уменьшить по Y
    7: { x: 0.9, y: 0.9 },   // Уменьшаем медузу на 20%
   
};

export class SymbolView extends Container {
    private sprite: Sprite;
    public symbolId: number;

    constructor(symbolId: number) {
        super();
        this.symbolId = symbolId;

        const textureName = SymbolTextureMap[symbolId];
        this.sprite = new Sprite(Texture.from(textureName));
        
        const { symbolSize } = GameConfig.grid;
        
        this.sprite.width = symbolSize;
        this.sprite.height = symbolSize;
        
        // Применяем искажение пропорций
        const customScale = SymbolScaleMap[symbolId] || { x: 1, y: 1 };
        this.sprite.scale.x *= customScale.x;
        this.sprite.scale.y *= customScale.y;
        
        this.sprite.anchor.set(0.5);
        this.sprite.x = symbolSize / 2;
        this.sprite.y = symbolSize / 2;

        this.addChild(this.sprite);
    }
}