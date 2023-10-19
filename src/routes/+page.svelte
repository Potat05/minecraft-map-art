<script lang="ts">
    import { onMount } from "svelte";
    import * as ImageUtils from "$lib/ImageUtils";
    import { ColorTone, MapColors, evaluateColor } from "$lib/minecraft-map-art/colors";

    let baseImgCanvas: HTMLCanvasElement;
    let quantizedImgCanvas: HTMLCanvasElement;

    onMount(async () => {

        const baseImg = await ImageUtils.BetterImageData.from('/test.png');
        baseImg.createDisplay(baseImgCanvas);

        const palette = new ImageUtils.Palette(
            MapColors.map(mapColor => {
                return [ ColorTone.Dark, ColorTone.Normal, ColorTone.Light, ColorTone.Color4 ].map(tone => {
                    return evaluateColor(mapColor.color, tone);
                });
            }).flat()
        );

        console.log(palette);

        const quantizedImg = baseImg.toPaletted(palette);
        quantizedImg.createDisplay(quantizedImgCanvas);

    });

</script>

<canvas bind:this={baseImgCanvas} />
<canvas bind:this={quantizedImgCanvas} />
