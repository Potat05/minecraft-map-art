import { Palette, type BetterImageData } from "$lib/ImageUtils";
import { ColorTone, MapColors, evaluateColor } from "./colors";
import { NBT_Byte_Array, NBT_Compound, NBT_List, NBT_Number, NBT_Tag, encodeNBT } from "./nbt";



export function encodeImageToMapNBTs(image: BetterImageData): ArrayBuffer[] {

    const mapWidth = Math.ceil(image.width / 128);
    const mapHeight = Math.ceil(image.height / 128);

    const mapPalette = new Palette(
        MapColors.map(mapColor => {
            return [ ColorTone.Dark, ColorTone.Normal, ColorTone.Light, ColorTone.Color4 ].map(tone => {
                return evaluateColor(mapColor.color, tone);
            });
        }).flat()
    );



    let nbts: ArrayBuffer[] = [];

    for(let mapX = 0; mapX < mapWidth; mapX++) {
        for(let mapY = 0; mapY < mapHeight; mapY++) {

            const section = image.getSection(mapX * 128, mapY * 128, 128, 128);

            const quan = section.toPaletted(mapPalette);

            const colors = new Int8Array(128 * 128);
            quan.indices.forEach((pal, ind) => {
                colors[ind] = pal;
            });

            const nbt = encodeNBT({
                DataVersion: new NBT_Number('Int', 3578), // 1.20.2
                data: {
                    // TODO: Change this order (This order is just temporary for debugging differences in NBT data.)
                    unlimitedTracking: false,
                    frames: new NBT_List(NBT_Tag.Compound, []),
                    banners: new NBT_List(NBT_Tag.Compound, []),
                    trackingPosition: false,
                    zCenter: new NBT_Number('Int', 0),
                    locked: true,
                    xCenter: new NBT_Number('Int', 0),
                    dimension: 'minecraft:overworld',
                    scale: new NBT_Number('Byte', 0),
                    colors: new NBT_Byte_Array(colors)
                }
            });

        }
    }

    return nbts;

}


