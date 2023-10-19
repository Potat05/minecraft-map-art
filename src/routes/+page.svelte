<script lang="ts">
    import * as ImageUtils from "$lib/ImageUtils";
    import { ColorTone, MapColors, evaluateColor } from "$lib/minecraft-map-art/colors";

    let files: FileList;

    $: if(files) {
        const file = files.item(0);

        if(file) {
            update(file);
        }
    }

    let baseImgCanvas: HTMLCanvasElement;
    let resizedImgCanvas: HTMLCanvasElement;
    let quantizedImgCanvas: HTMLCanvasElement;

    async function update(file: File): Promise<void> {

        const baseImg = await ImageUtils.BetterImageData.from(file);
        baseImg.clearAlpha();
        baseImg.createDisplay(baseImgCanvas);

        const resizeToLength = 128;
        const [ resizeWidth, resizeHeight ] = (
            baseImg.width > baseImg.height ?
            [ resizeToLength, baseImg.height * (resizeToLength / baseImg.width) ] :
            [ baseImg.width * (resizeToLength / baseImg.height), resizeToLength ]
        );
        const resizedImg = baseImg.resize(resizeWidth, resizeHeight);
        resizedImg.createDisplay(resizedImgCanvas);

        const palette = new ImageUtils.Palette(
            MapColors.map(mapColor => {
                return [ ColorTone.Dark, ColorTone.Normal, ColorTone.Light, ColorTone.Color4 ].map(tone => {
                    return evaluateColor(mapColor.color, tone);
                });
            }).flat()
        );

        const quantizedImg = resizedImg.toPaletted(palette);
        quantizedImg.createDisplay(quantizedImgCanvas);
    }

</script>

<!-- svelte-ignore a11y-missing-attribute -->
<input type="file" accept="image/*" bind:files={files}/>

<canvas bind:this={baseImgCanvas} />
<canvas bind:this={resizedImgCanvas} />
<canvas bind:this={quantizedImgCanvas} />
