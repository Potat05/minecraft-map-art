<script lang="ts">
    import { onMount } from "svelte";
    import { ImageUtils } from "$lib/ImageUtils";
    import { ColorTone, MapColors, evaluateColor } from "$lib/minecraft-map-art/colors";

    let baseImgCanvas: HTMLCanvasElement;
    let quantizedImgCanvas: HTMLCanvasElement;

    onMount(async () => {

        const baseImg = await ImageUtils.BetterImageData.from('/test.png');
        baseImg.createDisplay(baseImgCanvas);

        const palette = new ImageUtils.Palette(
            MapColors.map(mapColor => {
                return [ ColorTone.Dark, ColorTone.Normal, ColorTone.Light, ColorTone.Color4 ].map(tone => {
                    const color = evaluateColor(mapColor.color, tone);
                    return ImageUtils.Color.from(
                        color[0] / 255,
                        color[1] / 255,
                        color[2] / 255,
                        1
                    );
                });
            }).flat()
        );

        const quantizedImg = baseImg.toPaletted(palette);
        quantizedImg.createDisplay(quantizedImgCanvas);

    });

</script>

<canvas bind:this={baseImgCanvas} />
<canvas bind:this={quantizedImgCanvas} />
