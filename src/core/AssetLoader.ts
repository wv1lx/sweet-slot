import { Assets } from 'pixi.js';

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
    10: 'scatter_gold',
    11: 'chest_multi'
};

export class AssetLoader {
    public static async loadAll() {
        Assets.add({ alias: 'bg', src: '/assets/bg.jpg' });
        Assets.add({ alias: 'frame', src: '/assets/frame.png' });

        // Укажите точное расширение вашего файла (.png или .jpg)
        Assets.add({ alias: 'frame_bs', src: '/assets/frame_bs.png' });

        // Символы
        Object.values(SymbolTextureMap).forEach(name => {
            Assets.add({ alias: name, src: `/assets/symbols/${name}.png` });
        });

        // Кнопки интерфейса
        const uiButtons = ['spin', 'plus', 'minus', 'auto', 'info', 'settings'];
        uiButtons.forEach(name => {
            Assets.add({ alias: name, src: `/assets/${name}.png` });
        });

        // Обязательно добавляем 'frame_bs' в список загрузки:
        const aliasesToLoad = [
            'bg', 
            'frame', 
            'frame_bs',
            ...Object.values(SymbolTextureMap),
            ...uiButtons
        ];

        try {
            await Assets.load(aliasesToLoad);
            console.log('✅ Все ресурсы успешно загружены в кэш');
        } catch (error) {
            console.error('❌ Ошибка при загрузке ассетов:', error);
        }
    }
}