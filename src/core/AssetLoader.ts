import { Assets } from 'pixi.js';

// Связываем ID символов с точными названиями твоих файлов
export const SymbolTextureMap: Record<number, string> = {
    0: 'fish_orange',
    1: 'turtle',
    2: 'octopus',
    3: 'seahorse',
    4: 'fish_puffer',
    5: 'jellyfish',
    6: 'starfish',
    7: 'stingray',
    8: 'crab',
    9: 'fish_blue',
    10: 'scatter_gold', // Скаттер
    11: 'chest_multi'   // Множитель
};

export class AssetLoader {
    public static async loadAll() {
        Assets.add({ alias: 'bg', src: '/assets/bg.jpg' });
        Assets.add({ alias: 'frame', src: '/assets/frame.png' });

        // Автоматически загружаем все символы из папки symbols
        Object.values(SymbolTextureMap).forEach(name => {
            Assets.add({ alias: name, src: `/assets/symbols/${name}.png` });
        });

        // Загружаем минималистичные кнопки интерфейса из корня assets
        const uiButtons = ['spin', 'plus', 'minus', 'auto', 'info', 'settings'];
        uiButtons.forEach(name => {
            Assets.add({ alias: name, src: `/assets/${name}.png` });
        });

        const aliasesToLoad = [
            'bg', 
            'frame', 
            ...Object.values(SymbolTextureMap),
            ...uiButtons
        ];
        await Assets.load(aliasesToLoad);
    }
}