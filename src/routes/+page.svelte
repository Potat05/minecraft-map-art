<script lang="ts">
    import * as ImageUtils from "$lib/ImageUtils";
    import { encodeImageToMapNBTs } from "$lib/minecraft-map-art/map";
    import JSZip from 'jszip';

    let files: FileList;

    $: if(files) {
        const file = files.item(0);

        if(file) {
            update(file);
        }
    }

    let previewCanvas: HTMLCanvasElement;

    let mapsWidth: number = 2;
    let mapsHeight: number = 2;

    let downloadMaps: HTMLAnchorElement;

    async function update(file: File): Promise<void> {

        const baseImg = await ImageUtils.BetterImageData.from(file);

        const resizedImg = baseImg.resize(128 * Math.max(Math.min(mapsWidth, 10), 1), 128 * Math.max(Math.min(mapsHeight, 10), 1));

        const generated = encodeImageToMapNBTs(resizedImg);
        generated.baseImg.createDisplay(previewCanvas)

        const zip = new JSZip();

        const mapIndexOffset = Math.floor(Math.random() * 0xFFFF);

        generated.maps.forEach((map, i) => {
            zip.file(`data/map_${mapIndexOffset + i}.dat`, map);
        });

        const command = `/summon area_effect_cloud ~ ~1 ~ {Passengers: [${generated.maps.map((_, i) => `{id:"item",Item:{id:"minecraft:filled_map",Count:1b,tag:{map:${mapIndexOffset + i}}}}`).join(',')}]}`
        zip.file('how_to_use.txt', `1. Drag data folder into your world folder\n2. Run this command:\n${command}`)

        const blob = await zip.generateAsync({ type: 'blob'});

        downloadMaps.href = URL.createObjectURL(blob);

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

    input[type="number"] {
        color: black;
    }

</style>

<!-- svelte-ignore a11y-missing-attribute -->
<input type="file" accept="image/*" bind:files={files}/>

<input type="number" min=1 step=1 max=10 bind:value={mapsWidth} />
<input type="number" min=1 step=1 max=10 bind:value={mapsHeight} />

<canvas bind:this={previewCanvas} />

<!-- svelte-ignore a11y-missing-attribute -->
<a bind:this={downloadMaps} download="maps.zip" target="_blank">Download maps</a>
