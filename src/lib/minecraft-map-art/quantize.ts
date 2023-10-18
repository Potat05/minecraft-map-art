import { colorDistance, type Color, type MapColorList, evaluateColor, ColorTone } from "./colors";



export function getPalette(mapColors: MapColorList): Color[] {
    return mapColors.map(mapColor => {
        return [ evaluateColor(mapColor.color, ColorTone.Dark), evaluateColor(mapColor.color, ColorTone.Normal), evaluateColor(mapColor.color, ColorTone.Light), evaluateColor(mapColor.color, ColorTone.Color4) ]
    }).flat();
}



export function quantize(img: ImageData, mapColors: MapColorList, allowedColors: [ boolean, boolean, boolean, boolean ] = [ true, true, true, false ]): number[] {
    const colors = new Array(img.width * img.height).fill(0);

    const palette = getPalette(mapColors);

    for(let x = 0; x < img.width; x++) {
        for(let y = 0; y < img.height; y++) {
            const index = x + y * img.width;

            const imgColor: Color = [
                img.data[index*4 + 0],
                img.data[index*4 + 1],
                img.data[index*4 + 2]
            ];

            // Quantize color to palette
            const closest = palette.reduce((best, current) => {
                if(best === undefined) return current;
                if(colorDistance(best, imgColor) < colorDistance(current, imgColor)) return best;
                return current;
            });

            const closestIndex = palette.indexOf(closest);

            colors[index] = closestIndex;

        }
    }

    return colors;
}


