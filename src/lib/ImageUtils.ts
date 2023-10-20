


export async function awaitImageLoad(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {

        // TODO: If image is already loaded, this does not work.

        const loadListener = () => {
            img.removeEventListener('load', loadListener);
            img.removeEventListener('error', errorListener);

            resolve();
        }
        const errorListener = (error: ErrorEvent) => {
            img.removeEventListener('load', loadListener);
            img.removeEventListener('error', errorListener);

            reject(error);
        }

        img.addEventListener('load', loadListener);
        img.addEventListener('error', errorListener);

    });
}

export function getImageData(img: ImageData | HTMLCanvasElement | ImageDataBase): ImageData;
export function getImageData(img: HTMLImageElement | string | Blob): Promise<ImageData>;
export function getImageData(img: any) {

    if(img instanceof ImageData) {
        return img;
    }

    if(img instanceof BetterImageData) {
        return img.getImageData();
    }

    if(img instanceof HTMLCanvasElement) {
        const ctx = get2dContext(img);
        return ctx.getImageData(0, 0, img.width, img.height);
    }

    return new Promise(async resolve => {

        if(img instanceof Blob) {
            const url = URL.createObjectURL(img);
            resolve(await getImageData(url));
            URL.revokeObjectURL(url);
            return;
        }

        if(typeof img == 'string') {
            const imgSrc = img;
            const newImg = img = document.createElement('img');
            newImg.src = imgSrc;
            return resolve(await getImageData(newImg));
        }

        if(img instanceof HTMLImageElement) {
            await awaitImageLoad(img);
            const [ canvas, ctx ] = getCanvas(img.naturalWidth, img.naturalHeight);
            ctx.drawImage(img, 0, 0);
            return resolve(getImageData(canvas));
        }

        throw new Error('Invalid img type.');

    });

}

export function getCanvas(width: number = 400, height: number = 400, canvas?: HTMLCanvasElement): [ HTMLCanvasElement, CanvasRenderingContext2D ] {
    if(canvas === undefined) canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return [ canvas, get2dContext(canvas) ];
}

export function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if(!ctx) {
        throw new Error('Canvas rendering context 2d is not supported on browser or machine.');
    }
    return ctx;
}



export class Color {

    public static from(color: Color): Color;
    public static from(color: { r: number, g: number, b: number, a?: number }): Color;
    public static from(color: [ number, number, number ] | [ number, number, number, number ]): Color;
    public static from(r: number, g: number, b: number, a?: number): Color;
    public static from(arg1: Color | { r: number, g: number, b: number, a?: number } | [ number, number, number ] | [ number, number, number, number ] | number, arg2?: number, arg3?: number, arg4?: number): Color {
        if(arg1 instanceof Color) {
            return new Color(arg1.r, arg1.g, arg1.b, arg1.a);
        }
        if(Array.isArray(arg1)) {
            return new Color(...arg1);
        }
        if(typeof arg1 == 'object') {
            return new Color(arg1.r, arg1.g, arg1.b, arg1.a);
        }
        if(typeof arg1 == 'number') {
            return new Color(arg1, arg2, arg3, arg4);
        }
        throw new Error('Color.from: Invalid arguments.')
    }

    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public clearAlpha(): this {
        this.a = 1;
        return this;
    }

    public static distance(a: Color, b: Color): number {
        // Alpha gets more distance than the other components.
        // This is to stop some quantization issues.
        return Math.sqrt((b.r - a.r)**2 + (b.g - a.g)**2 + (b.b - a.b)**2 + ((b.a - a.a)*2)**2);
    }

    public static sub(a: Color, b: Color): Color {
        return new Color(
            a.r - b.r,
            a.g - b.g,
            a.b - b.b,
            a.a - b.a,
        );
    }

    public static add(a: Color, b: Color): Color {
        return new Color(
            a.r + b.r,
            a.g + b.g,
            a.b + b.b,
            a.a + b.a,
        );
    }

    public static mul(a: Color, k: number): Color {
        return new Color(
            a.r * k,
            a.g * k,
            a.b * k,
            a.a * k
        );
    }

    public static div(a: Color, k: number): Color {
        return this.mul(a, 1 / k);
    }

}



export interface ImageDataBase {
    get(x: number, y: number): Color;
    set(x: number, y: number, color: Color): void;

    clearAlpha(): void;

    getImageData(): ImageData;
}

export abstract class ImageDataBase implements ImageDataBase {
    
    public readonly width: number;
    public readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        if((this.width <= 0) || (this.height <= 0) || (this.width % 1 != 0) || (this.height % 1 != 0)) {
            throw new Error(`Image invalid size. ${this.width}x${this.height}`);
        }
    }

    public isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // TODO: Make this return the correct type.
    public createDisplay(canvas?: HTMLCanvasElement): ImageDataDisplay<this> {
        return new ImageDataDisplay(this, canvas);
    }

    public getImage(as?: 'canvas'): HTMLCanvasElement;
    public getImage(as?: 'image'): HTMLImageElement;
    public getImage(as: 'canvas' | 'image' = 'canvas'): HTMLCanvasElement | HTMLImageElement {

        if(as == 'canvas') {
            const [ canvas, ctx ] = getCanvas(this.width, this.height);
            ctx.putImageData(this.getImageData(), 0, 0);
            return canvas;
        } else if(as == 'image') {
            throw new Error('Unimplemented.');
        } else {
            throw new Error('getImage invalid arguments.');
        }
        
    }

}



export type DitherMatrix = {
    matrix: number[][];
    offsetX: number;
    offsetY: number;
}

export const DitherMatrix = {
    FloydSteinberg: {
        matrix: [
            [ 0, 0, 0, 7, 0 ],
            [ 0, 3, 5, 1, 0 ],
            [ 0, 0, 0, 0, 0 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    Ordered3x3: {
        matrix: [
            [ 1, 7, 4 ],
            [ 5, 8, 3 ],
            [ 6, 2, 9 ]
        ],
        offsetX: 1,
        offsetY: 0
    },
    MinAvgErr: {
        matrix: [
            [ 0, 0, 0, 7, 5 ],
            [ 3, 5, 7, 5, 3 ],
            [ 1, 3, 5, 3, 1 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    Burkes: {
        matrix: [
            [ 0, 0, 0, 8, 4 ],
            [ 2, 4, 8, 4, 2 ],
            [ 0, 0, 0, 0, 0 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    SierraLite: {
        matrix: [
            [ 0, 0, 0, 2, 0 ],
            [ 0, 1, 1, 0, 0 ],
            [ 0, 0, 0, 0, 0 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    Stucki: {
        matrix: [
            [ 0, 0, 0, 8, 4 ],
            [ 2, 4, 8, 4, 2 ],
            [ 1, 2, 4, 2, 1 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    Atkinson: {
        matrix: [
            [ 0, 0, 0, 1, 1 ],
            [ 0, 1, 1, 1, 0 ],
            [ 0, 0, 1, 0, 0 ]
        ],
        offsetX: 2,
        offsetY: 0
    },
    MakeBayer: (power: number) => {

        if(power <= 0 || power > 4) {
            // No one would want a matrix that's bigger than 16x16.
            throw new Error('Invalid power.');
        }

        // https://en.wikipedia.org/wiki/Ordered_dithering
        // https://blog.42yeah.is/rendering/2023/02/18/dithering.html

        function upscale(matrix: number[][]): number[][] {

            const mWidth = matrix[0].length;
            const mHeight = matrix.length;

            const upscaled = new Array(mHeight * 2).fill(null).map(() => new Array(mWidth * 2).fill(0));

            for(let y = 0; y < mHeight; y++) {
                for(let x = 0; x < mWidth; x++) {
                    const cell = matrix[y][x];
                    const fac = 4;
                    upscaled[y][x] = fac * cell;
                    upscaled[y][x + mWidth] = fac * cell + 2;
                    upscaled[y + mHeight][x] = fac * cell + 3;
                    upscaled[y + mHeight][x + mWidth] = fac * cell + 1;
                }
            }

            return upscaled;

        }

        let matrix = [
            [ 0, 2 ],
            [ 3, 1 ]
        ];

        for(let i = 1; i < power; i++) {
            matrix = upscale(matrix);
        }

        return {
            matrix,
            offsetX: power == 1 ? 0 : 2,
            offsetY: 0
        }

    }
}



export class BetterImageData extends ImageDataBase {

    public static from(img: ImageData | HTMLCanvasElement | ImageDataBase): BetterImageData;
    public static from(img: HTMLImageElement | string | Blob): Promise<BetterImageData>;
    public static from(img: any) {
        const imgData = getImageData(img);
        if(imgData instanceof Promise) {
            return new Promise(async resolve => {
                const awaitedImgData = await imgData;
                return resolve(new BetterImageData(
                    new Float32Array(awaitedImgData.data).map(v => v / 255),
                    awaitedImgData.width,
                    awaitedImgData.height
                ));
            });
        } else {
            return new BetterImageData(
                new Float32Array(imgData.data).map(v => v / 255),
                imgData.width,
                imgData.height
            );
        }
    }

    public readonly data: Float32Array;

    constructor(data: Float32Array, width: number, height: number = data.length / width) {
        super(width, height);
        this.data = data;
        if(this.data.length != this.width * this.height * 4) {
            throw new Error('Image data invalid data length.');
        }
    }

    public get(x: number, y: number): Color {
        if(!this.isInBounds(x, y)) {
            throw new Error('Cannot get outside of image data.');
        }

        const i = x + y * this.width;

        return new Color(
            this.data[i*4 + 0],
            this.data[i*4 + 1],
            this.data[i*4 + 2],
            this.data[i*4 + 3]
        );
    }

    public set(x: number, y: number, color: Color): void {
        if(!this.isInBounds(x, y)) {
            throw new Error('Cannot set outside of image data.');
        }

        const i = x + y * this.width;

        this.data[i*4 + 0] = color.r;
        this.data[i*4 + 1] = color.g;
        this.data[i*4 + 2] = color.b;
        this.data[i*4 + 3] = color.a;
    }



    public clearAlpha(): void {
        for(let i = 3; i < this.data.length; i += 4) {
            this.data[i] = 1;
        }
    }



    public getImageData(): ImageData {
        return new ImageData(
            new Uint8ClampedArray(this.data.map(d => d * 255)),
            this.width,
            this.height
        );
    }



    public toPaletted(palette: Palette, dither: DitherMatrix | null = DitherMatrix.FloydSteinberg, ditherAlpha: boolean = false): PalettedImageData {
        const img = PalettedImageData.empty(palette, this.width, this.height);



        /*

            https://bisqwit.iki.fi/story/howto/dither/jy/
            https://shihn.ca/posts/2020/dithering/

        */

        

        const ditherDivisor = dither?.matrix.reduce((total, row) => {
            return total + row.reduce((total, value) => total + value, 0);
        }, 0) ?? 1;

        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {

                const oldPixel = this.get(x, y);
                const newPixelIndex = palette.quantize(oldPixel);
                const newPixel = palette.get(newPixelIndex);

                img.setIndex(x, y, newPixelIndex);

                if(dither === null) continue;

                const quant_error = Color.sub(oldPixel, newPixel);

                if(!ditherAlpha) {
                    quant_error.a = 0;
                }

                for(let dy = 0; dy < dither.matrix.length; dy++) {
                    for(let dx = 0; dx < dither.matrix[dy].length; dx++) {
                        const mul = dither.matrix[dy][dx];

                        const xx = x + dx - dither.offsetX;
                        const yy = y + dy - dither.offsetY;

                        if(!img.isInBounds(xx, yy)) continue;

                        this.set(xx, yy, Color.add(this.get(xx, yy), Color.mul(quant_error, mul / ditherDivisor)));

                    }
                }

            }
        }

        return img;
    }



    public resize(scale: number, smoothing?: 'off' | 'low' | 'medium' | 'high'): BetterImageData;
    public resize(width: number, height: number, method?: 'strech' | 'contain' | 'cover', smoothing?: 'off' | 'low' | 'medium' | 'high'): BetterImageData;
    public resize(arg1: number, arg2?: 'off' | 'low' | 'medium' | 'high' | number, arg3?: 'strech' | 'contain' | 'cover', arg4?: 'off' | 'low' | 'medium' | 'high'): BetterImageData {

        const [ width, height, smoothing, method ]: [
            number,
            number,
            'off' | 'low' | 'medium' | 'high',
            'strech' | 'contain' | 'cover'
        ] = (
            (arg2 === undefined || typeof arg2 == 'string') ?
            [ Math.round(this.width * arg1), Math.round(this.height * arg1), arg2 ?? 'high', 'strech' ] :
            [ Math.round(arg1), Math.round(arg2), arg4 ?? 'high', arg3 ?? 'contain' ]
        );

        if(width <= 0 || height <= 0 || Number.isNaN(width) || Number.isNaN(height)) {
            throw new Error('Invalid arguments.');
        }

        const [ canvas, ctx ] = getCanvas(width, height);

        if(smoothing == 'off') {
            ctx.imageSmoothingEnabled = false;
        } else {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = smoothing;
        }

        // TODO: Add none method that just centers and doesn't resize.
        if(method == 'strech') {
            ctx.drawImage(this.getImage(), 0, 0, width, height);
        } else if(method == 'contain') {
            const ratio = Math.min(width / this.width, height / this.height);
            ctx.drawImage(this.getImage(), 0, 0, this.width, this.height, (width - this.width*ratio) / 2, (height - this.height*ratio) / 2, this.width*ratio, this.height*ratio);
        } else if(method == 'cover') {
            const ratio = Math.max(width / this.width, height / this.height);
            ctx.drawImage(this.getImage(), 0, 0, this.width, this.height, (width - this.width*ratio) / 2, (height - this.height*ratio) / 2, this.width*ratio, this.height*ratio);
        } else {
            throw new Error('Invalid arguments.');
        }

        return BetterImageData.from(canvas);

    }

    public getSection(x: number, y: number, width: number, height: number): BetterImageData {
        const [ canvas, ctx ] = getCanvas(width, height);
        ctx.putImageData(this.getImageData(), -x, -y);
        return BetterImageData.from(canvas);
    }

}



export class Palette {
    public readonly colors: Color[] = [];

    constructor(numColors: number);
    constructor(colors: Color[]);
    constructor(arg1: Color[] | number) {
        this.colors = (typeof arg1 == 'number' ? new Array(arg1).fill(null).map(() => new Color()) : arg1);
    }

    public get(index: number): Color {
        return this.colors[index];
    }

    public set(index: number, color: Color): void {
        this.colors[index] = color;
    }

    public clearAlpha(): void {
        this.colors.forEach(color => color.a = 1);
    }

    public quantize(color: Color): number {

        let closestIndex: number = 0;
        let closestDistance: number = Infinity;

        for(let currentIndex = 1; currentIndex < this.colors.length; currentIndex++) {

            const distance = Color.distance(this.colors[currentIndex], color);

            if(distance < closestDistance) {
                closestIndex = currentIndex;
                closestDistance = distance;
            }

        }

        return closestIndex;

    }
}

export class PalettedImageData extends ImageDataBase  {

    static empty(palette: Palette, width: number, height: number): PalettedImageData {
        return new this(
            palette,
            new Uint32Array(width * height),
            width,
            height
        );
    }

    public readonly palette: Palette;
    public readonly indices: Uint32Array;

    constructor(palette: Palette, indices: Uint32Array, width: number, height: number) {
        super(width, height);
        this.palette = palette;
        this.indices = indices;
        if(this.indices.length != this.width * this.height) {
            throw new Error('Paletted image data invalid indices array length.');
        }
    }

    public getIndex(x: number, y: number): number {
        if(!this.isInBounds(x, y)) {
            throw new Error('Cannot get outside of image data.');
        }

        const i = x + y * this.width;

        return this.indices[i];
    }

    public get(x: number, y: number): Color {
        return this.palette.get(this.getIndex(x, y));
    }

    public setIndex(x: number, y: number, index: number): void {
        if(!this.isInBounds(x, y)) {
            throw new Error('Cannot get outside of image data.');
        }

        const i = x + y * this.width;

        this.indices[i] = index;
    }

    public set(x: number, y: number, color: Color): void {
        this.setIndex(x, y, this.palette.quantize(color));
    }



    public clearAlpha(): void {
        return this.palette.clearAlpha();
    }



    public getImageData(): ImageData {

        const data = new Uint8ClampedArray(this.width * this.height * 4);
        for(let i = 0; i < this.width * this.height; i++) {
            const color = this.palette.get(this.indices[i]);
            data[i*4 + 0] = color.r * 255;
            data[i*4 + 1] = color.g * 255;
            data[i*4 + 2] = color.b * 255;
            data[i*4 + 3] = color.a * 255;
        }

        return new ImageData(
            data,
            this.width,
            this.height
        );
    }

}



export class ImageDataDisplay<T extends ImageDataBase> {
    public readonly img: T;
    public readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    constructor(img: T, canvas: HTMLCanvasElement = document.createElement('canvas')) {
        this.img = img;

        this.canvas = canvas;
        this.canvas.width = img.width;
        this.canvas.height = img.height;

        const ctx = this.canvas.getContext('2d');
        if(!ctx) {
            throw new Error('Canvas rendering context 2d is not supported on browser or machine.');
        }
        this.ctx = ctx;

        this.update();
    }

    public update(): void {
        this.ctx.putImageData(this.img.getImageData(), 0, 0);
    }
}


