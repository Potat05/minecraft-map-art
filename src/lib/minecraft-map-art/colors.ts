
/*

    https://minecraft.wiki/w/Map_item_format#Base_colors

*/

import { Color } from "$lib/ImageUtils";



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

    return new Color(
        (color.r * multiplier) / (255 * 255),
        (color.g * multiplier) / (255 * 255),
        (color.b * multiplier) / (255 * 255),
        color.a
    );

}



export type MapColor = {
    name: string;
    color: Color;
    blocks: any[];
}

export type MapColorList = MapColor[];



// TODO: Add blocks to the list.
export const MapColors: MapColorList = [
    {
        name: 'NONE',
        color: new Color(0, 0, 0, 0),
        blocks: []
    },
    {
        name: 'GRASS',
        color: new Color(127, 178, 56),
        blocks: []
    },
    {
        name: 'SAND',
        color: new Color(247, 233, 163),
        blocks: []
    },
    {
        name: 'WOOL',
        color: new Color(199, 199, 199),
        blocks: []
    },
    {
        name: 'FIRE',
        color: new Color(255, 0, 0),
        blocks: []
    },
    {
        name: 'ICE',
        color: new Color(160, 160, 255),
        blocks: []
    },
    {
        name: 'METAL',
        color: new Color(167, 167, 167),
        blocks: []
    },
    {
        name: 'PLANT',
        color: new Color(0, 124, 0),
        blocks: []
    },
    {
        name: 'SNOW',
        color: new Color(255, 255, 255),
        blocks: []
    },
    {
        name: 'CLAY',
        color: new Color(164, 168, 184),
        blocks: []
    },
    {
        name: 'DIRT',
        color: new Color(151, 109, 77),
        blocks: []
    },
    {
        name: 'STONE',
        color: new Color(112, 112, 112),
        blocks: []
    },
    {
        name: 'WATER',
        color: new Color(64, 64, 255),
        blocks: []
    },
    {
        name: 'WOOD',
        color: new Color(143, 119, 72),
        blocks: []
    },
    {
        name: 'QUARTZ',
        color: new Color(255, 252, 245),
        blocks: []
    },
    {
        name: 'COLOR_ORANGE',
        color: new Color(216, 127, 51),
        blocks: []
    },
    {
        name: 'COLOR_MAGENTA',
        color: new Color(178, 76, 216),
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_BLUE',
        color: new Color(102, 153, 216),
        blocks: []
    },
    {
        name: 'COLOR_YELLOW',
        color: new Color(229, 229, 51),
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_GREEN',
        color: new Color(127, 204, 25),
        blocks: []
    },
    {
        name: 'COLOR_PINK',
        color: new Color(242, 127, 165),
        blocks: []
    },
    {
        name: 'COLOR_GRAY',
        color: new Color(76, 76, 76),
        blocks: []
    },
    {
        name: 'COLOR_LIGHT_GRAY',
        color: new Color(153, 153, 153),
        blocks: []
    },
    {
        name: 'COLOR_CYAN',
        color: new Color(76, 127, 153),
        blocks: []
    },
    {
        name: 'COLOR_PURPLE',
        color: new Color(127, 63, 178),
        blocks: []
    },
    {
        name: 'COLOR_BLUE',
        color: new Color(51, 76, 178),
        blocks: []
    },
    {
        name: 'COLOR_BROWN',
        color: new Color(102, 76, 51),
        blocks: []
    },
    {
        name: 'COLOR_GREEN',
        color: new Color(102, 127, 51),
        blocks: []
    },
    {
        name: 'COLOR_RED',
        color: new Color(153, 51, 51),
        blocks: []
    },
    {
        name: 'COLOR_BLACK',
        color: new Color(25, 25, 25),
        blocks: []
    },
    {
        name: 'GOLD',
        color: new Color(250, 238, 77),
        blocks: []
    },
    {
        name: 'DIAMOND',
        color: new Color(92, 219, 213),
        blocks: []
    },
    {
        name: 'LAPIS',
        color: new Color(74, 128, 255),
        blocks: []
    },
    {
        name: 'EMERALD',
        color: new Color(0, 217, 58),
        blocks: []
    },
    {
        name: 'PODZOL',
        color: new Color(129, 86, 49),
        blocks: []
    },
    {
        name: 'NETHER',
        color: new Color(112, 2, 0),
        blocks: []
    },
    {
        name: 'TERRACOTTA_WHITE',
        color: new Color(209, 177, 161),
        blocks: []
    },
    {
        name: 'TERRACOTTA_ORANGE',
        color: new Color(159, 82, 36),
        blocks: []
    },
    {
        name: 'TERRACOTTA_MAGENTA',
        color: new Color(149, 87, 108),
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_BLUE',
        color: new Color(112, 108, 138),
        blocks: []
    },
    {
        name: 'TERRACOTTA_YELLOW',
        color: new Color(186, 133, 36),
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_GREEN',
        color: new Color(103, 117, 53),
        blocks: []
    },
    {
        name: 'TERRACOTTA_PINK',
        color: new Color(160, 77, 78),
        blocks: []
    },
    {
        name: 'TERRACOTTA_GRAY',
        color: new Color(57, 41, 35),
        blocks: []
    },
    {
        name: 'TERRACOTTA_LIGHT_GRAY',
        color: new Color(135, 107, 98),
        blocks: []
    },
    {
        name: 'TERRACOTTA_CYAN',
        color: new Color(87, 92, 92),
        blocks: []
    },
    {
        name: 'TERRACOTTA_PURPLE',
        color: new Color(122, 73, 88),
        blocks: []
    },
    {
        name: 'TERRACOTTA_BLUE',
        color: new Color(76, 62, 92),
        blocks: []
    },
    {
        name: 'TERRACOTTA_BROWN',
        color: new Color(76, 50, 35),
        blocks: []
    },
    {
        name: 'TERRACOTTA_GREEN',
        color: new Color(76, 82, 42),
        blocks: []
    },
    {
        name: 'TERRACOTTA_RED',
        color: new Color(142, 60, 46),
        blocks: []
    },
    {
        name: 'TERRACOTTA_BLACK',
        color: new Color(37, 22, 16),
        blocks: []
    },
    {
        name: 'CRIMSON_NYLIUM',
        color: new Color(189, 48, 49),
        blocks: []
    },
    {
        name: 'CRIMSON_STEM',
        color: new Color(148, 63, 97),
        blocks: []
    },
    {
        name: 'CRIMSON_HYPHAE',
        color: new Color(92, 25, 29),
        blocks: []
    },
    {
        name: 'WARPED_NYLIUM',
        color: new Color(22, 126, 134),
        blocks: []
    },
    {
        name: 'WARPED_STEM',
        color: new Color(58, 142, 140),
        blocks: []
    },
    {
        name: 'WARPED_HYPHAE',
        color: new Color(86, 44, 62),
        blocks: []
    },
    {
        name: 'WARPED_WART_BLOCK',
        color: new Color(20, 180, 133),
        blocks: []
    },
    {
        name: 'DEEPSLATE',
        color: new Color(100, 100, 100),
        blocks: []
    },
    {
        name: 'RAW_IRON',
        color: new Color(216, 175, 147),
        blocks: []
    },
    {
        name: 'GLOW_LICHEN',
        color: new Color(127, 167, 150),
        blocks: []
    }
];


