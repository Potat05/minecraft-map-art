<script lang="ts">
    import * as ImageUtils from "$lib/ImageUtils";
    import { ColorTone, MapColors, evaluateColor } from "$lib/minecraft-map-art/colors";
    import { encodeImageToMapNBTs } from "$lib/minecraft-map-art/map";

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

        // const baseImg = await ImageUtils.BetterImageData.from(file);
        // baseImg.createDisplay(baseImgCanvas);

        // const resizeToLength = 512;
        // let [ resizeWidth, resizeHeight ] = (
        //     baseImg.width > baseImg.height ?
        //     [ resizeToLength, baseImg.height * (resizeToLength / baseImg.width) ] :
        //     [ baseImg.width * (resizeToLength / baseImg.height), resizeToLength ]
        // );
        // resizeWidth += resizeWidth % 128;
        // resizeHeight += resizeHeight % 128;
        
        // const resizedImg = baseImg.resize(resizeWidth, resizeHeight);
        // resizedImg.createDisplay(resizedImgCanvas);

        // const palette = new ImageUtils.Palette(
        //     MapColors.map(mapColor => {
        //         return [ ColorTone.Dark, ColorTone.Normal, ColorTone.Light, ColorTone.Color4 ].map(tone => {
        //             return evaluateColor(mapColor.color, tone);
        //         });
        //     }).flat()
        // );

        // const quantizedImg = resizedImg.toPaletted(palette, ImageUtils.DitherMatrix.Burkes);
        // quantizedImg.createDisplay(quantizedImgCanvas);



        const baseImg = await ImageUtils.BetterImageData.from(file);
        baseImg.createDisplay(baseImgCanvas);

        // const resizedImg = baseImg.resize(128 * 2, 128 * 3);
        const resizedImg = baseImg.resize(128, 128);
        resizedImg.createDisplay(resizedImgCanvas);

        const maps = encodeImageToMapNBTs(resizedImg);

        const download = document.createElement('a');
        download.target = '_blank';
        download.href = URL.createObjectURL(new Blob([ maps[0] ]));
        download.download = 'map_1.dat';
        download.innerText = 'Download maps';

        document.body.appendChild(download);

        console.log(maps);

    }

</script>

<svelte:head>
    <style>

        body {
            background-color: #111;
        }

        * {
            color: white;
        }

    </style>
</svelte:head>

<style>

    canvas {
        background-attachment: fixed;
        background-image: url('./transparent-background.png');
        background-size: 32px;
        image-rendering: pixelated;
    }

</style>

<!-- svelte-ignore a11y-missing-attribute -->
<input type="file" accept="image/*" bind:files={files}/>

<canvas bind:this={quantizedImgCanvas} />
