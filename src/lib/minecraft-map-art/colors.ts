
/*

    https://minecraft.wiki/w/Map_item_format#Base_colors

*/



export type Color = [ number, number, number ];

export enum ColorTone {
    Dark,
    Normal,
    Light,
    /** Unobtainable. */
    Color4
}

export function evaluateColor(color: Color, tone: ColorTone): Color {

    const multiplier: number = {
        [ColorTone.Dark]: 180,
        [ColorTone.Normal]: 220,
        [ColorTone.Light]: 255,
        [ColorTone.Color4]: 135
    }[tone];

    return [
        Math.floor((color[0] * multiplier) / 255),
        Math.floor((color[1] * multiplier) / 255),
        Math.floor((color[2] * multiplier) / 255)
    ];

}

export function colorDistance(color1: Color, color2: Color): number {
    return Math.sqrt(
        (color2[0] - color1[0])**2 +
        (color2[1] - color1[1])**2 +
        (color2[2] - color1[2])**2
    );
}



export type Block = {
    name: string;
    id: string;
    flammable: boolean;
    requiresSupport: boolean;
}



export type MapColor = {
    name: string;
    color: Color;
    blocks: Block[];
}

export type MapColorList = MapColor[];



// TODO: Add blocks to the list.
export const MapColors: MapColorList = [
    {
        name: 'NONE',
        color: [ 0, 0, 0 ],
        blocks: []
    },
    {
        name: 'GRASS',
        color: [ 127, 178, 56 ],
        blocks: []
    },
    {
        name: 'SAND',
        color: [ 247, 233, 163 ],
        blocks: []
    },
    {
        name: 'WOOL',
        color: [ 199, 199, 199 ],
        blocks: []
    },
    {
        name: 'FIRE',
        color: [ 255, 0, 0 ],
        blocks: []
    },
    {
        name: 'ICE',
        color: [ 160, 160, 255 ],
        blocks: []
    },
    {
        name: 'METAL',
        color: [ 167, 167, 167 ],
        blocks: []
    },
    {
        name: 'PLANT',
        color: [ 0, 124, 0 ],
        blocks: []
    },
    {
        name: 'SNOW',
        color: [ 255, 255, 255 ],
        blocks: []
    },
    {
        name: 'CLAY',
        color: [ 164, 168, 184 ],
        blocks: []
    },
    {
        name: 'DIRT',
        color: [ 151, 109, 77 ],
        blocks: []
    },
    {
        name: 'STONE',
        color: [ 112, 112, 112 ],
        blocks: []
    },
    {
        name: 'WATER',
        color: [ 64, 64, 255 ],
        blocks: []
    },
    {
        name: 'WOOD',
        color: [ 143, 119, 72 ],
        blocks: []
    },
    {
        name: 'QUARTZ',
        color: [ 255, 252, 245 ],
        blocks: []
    },
    {
        name: 'COLOR_ORANGE',
        color: [ 216, 127, 51 ],
        blocks: []
    },
    {
        name: 'COLOR_MAGENTA',
        color: [ 178, 76, 216 ],
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_BLUE',
        color: [ 102, 153, 216 ],
        blocks: []
    },
    {
        name: 'COLOR_YELLOW',
        color: [ 229, 229, 51 ],
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_GREEN',
        color: [ 127, 204, 25 ],
        blocks: []
    },
    {
        name: 'COLOR_PINK',
        color: [ 242, 127, 165 ],
        blocks: []
    },
    {
        name: 'COLOR_GRAY',
        color: [ 76, 76, 76 ],
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_GRAY',
        color: [ 153, 153, 153 ],
        blocks: []
    },
    {
        name: 'COLOR_CYAN',
        color: [ 76, 127, 153 ],
        blocks: []
    },
    {
        name: 'COLOR_PURPLE',
        color: [ 127, 63, 178 ],
        blocks: []
    },
    {
        name: 'COLOR_BLUE',
        color: [ 51, 76, 178 ],
        blocks: []
    },
    {
        name: 'COLOR_BROWN',
        color: [ 102, 76, 51 ],
        blocks: []
    },
    {
        name: 'COLOR_GREEN',
        color: [ 102, 127, 51 ],
        blocks: []
    },
    {
        name: 'COLOR_RED',
        color: [ 153, 51, 51 ],
        blocks: []
    },
    {
        name: 'COLOR_BLACK',
        color: [ 25, 25, 25 ],
        blocks: []
    },
    {
        name: 'GOLD',
        color: [ 250, 238, 77 ],
        blocks: []
    },
    {
        name: 'DIAMOND',
        color: [ 92, 219, 213 ],
        blocks: []
    },
    {
        name: 'LAPIS',
        color: [ 74, 128, 255 ],
        blocks: []
    },
    {
        name: 'EMERALD',
        color: [ 0, 217, 58 ],
        blocks: []
    },
    {
        name: 'PODZOL',
        color: [ 129, 86, 49 ],
        blocks: []
    },
    {
        name: 'NETHER',
        color: [ 112, 2, 0 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_WHITE',
        color: [ 209, 177, 161 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_ORANGE',
        color: [ 159, 82, 36 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_MAGENTA',
        color: [ 149, 87, 108 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_BLUE',
        color: [ 112, 108, 138 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_YELLOW',
        color: [ 186, 133, 36 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_GREEN',
        color: [ 103, 117, 53 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_PINK',
        color: [ 160, 77, 78 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_GRAY',
        color: [ 57, 41, 35 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_GRAY',
        color: [ 135, 107, 98 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_CYAN',
        color: [ 87, 92, 92 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_PURPLE',
        color: [ 122, 73, 88 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_BLUE',
        color: [ 76, 62, 92 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_BROWN',
        color: [ 76, 50, 35 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_GREEN',
        color: [ 76, 82, 42 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_RED',
        color: [ 142, 60, 46 ],
        blocks: []
    },
    {
        name: 'TERRACOTTA_BLACK',
        color: [ 37, 22, 16 ],
        blocks: []
    },
    {
        name: 'CRIMSON_NYLIUM',
        color: [ 189, 48, 49 ],
        blocks: []
    },
    {
        name: 'CRIMSON_STEM',
        color: [ 148, 63, 97 ],
        blocks: []
    },
    {
        name: 'CRIMSON_HYPHAE',
        color: [ 92, 25, 29 ],
        blocks: []
    },
    {
        name: 'WARPED_NYLIUM',
        color: [ 22, 126, 134 ],
        blocks: []
    },
    {
        name: 'WARPED_STEM',
        color: [ 58, 142, 140 ],
        blocks: []
    },
    {
        name: 'WARPED_HYPHAE',
        color: [ 86, 44, 62 ],
        blocks: []
    },
    {
        name: 'WARPED_WART_BLOCK',
        color: [ 20, 180, 133 ],
        blocks: []
    },
    {
        name: 'DEEPSLATE',
        color: [ 100, 100, 100 ],
        blocks: []
    },
    {
        name: 'RAW_IRON',
        color: [ 216, 175, 147 ],
        blocks: []
    },
    {
        name: 'GLOW_LICHEN',
        color: [ 127, 167, 150 ],
        blocks: []
    }
];


