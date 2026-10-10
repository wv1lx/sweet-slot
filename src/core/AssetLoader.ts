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
        Assets.add({ alias: 'bg_bonus', src: '/assets/bg_bonus.jpg' }); // Новый фон сокровищницы
        Assets.add({ alias: 'frame', src: '/assets/frame.png' });
        Assets.add({ alias: 'frame_bs', src: '/assets/frame_bs.png' });

        Object.values(SymbolTextureMap).forEach(name => {
            Assets.add({ alias: name, src: `/assets/symbols/${name}.png` });
        });

        const uiButtons = ['spin', 'plus', 'minus', 'auto', 'info', 'settings'];
        uiButtons.forEach(name => {
            Assets.add({ alias: name, src: `/assets/${name}.png` });
        });

        const aliasesToLoad = [
            'bg', 
            'bg_bonus',
            'frame', 
            'frame_bs',
            ...Object.values(SymbolTextureMap),
            ...uiButtons
        ];

        await Assets.load(aliasesToLoad);
    }
}