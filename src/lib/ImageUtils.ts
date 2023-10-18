


export namespace ImageUtils {

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

    export async function getImageData(img: ImageData | HTMLImageElement | HTMLCanvasElement | string | BetterImageData): Promise<ImageData> {
        return new Promise(async (resolve, reject) => {

            if(img instanceof ImageData) {
                return resolve(img);
            }

            if(img instanceof BetterImageData) {
                return resolve(img.getImageData());
            }

            if(typeof img == 'string') {
                const imgSrc = img;
                img = document.createElement('img');
                img.src = imgSrc;
                return resolve(await getImageData(img));
            }

            if(img instanceof HTMLImageElement) {
                await awaitImageLoad(img).catch(reject);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if(!ctx) {
                    return reject('Canvas rendering context 2d is not supported on browser or machine.');
                }
                ctx.drawImage(img, 0, 0);
                return resolve(await getImageData(canvas));
            }

            if(img instanceof HTMLCanvasElement) {
                const canvas = img;
                const ctx = canvas.getContext('2d');
                if(!ctx) {
                    return reject('Canvas rendering context 2d is not supported on browser or machine.');
                }
                return resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
            }

            reject('Invalid img type.');

        });
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
            return Math.sqrt((b.r - a.r)**2 + (b.g - a.g)**2 + (b.b - a.b)**2 + (b.a - a.a)**2);
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

    }



    export class BetterImageData extends ImageDataBase {

        public static async from(...args: Parameters<typeof getImageData>): Promise<BetterImageData> {
            const img = await getImageData(...args);
            return new this(
                new Float32Array(img.data).map(v => v / 255),
                img.width,
                img.height
            );
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
            for(let i = 3; i < this.data.length; i++) {
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



        public toPaletted(palette: Palette, dither: boolean = true): PalettedImageData {
            const img = PalettedImageData.empty(palette, this.width, this.height);



            /*

                https://bisqwit.iki.fi/story/howto/dither/jy/
                https://shihn.ca/posts/2020/dithering/

            */

            

            const offsets: { x: number, y: number, mul: number }[] = [
                { x: 1, y: 0, mul: 7 },
                { x: -1, y: 1, mul: 3  },
                { x: 0, y: 1, mul: 5 },
                { x: 1, y: 1, mul: 1 }
            ];
            const totalMul = offsets.reduce((total, offset) => total + offset.mul, 0);

            for(let y = 0; y < this.height; y++) {
                for(let x = 0; x < this.width; x++) {

                    const oldPixel = this.get(x, y);
                    const newPixelIndex = palette.quantize(oldPixel);
                    const newPixel = palette.get(newPixelIndex);

                    img.setIndex(x, y, newPixelIndex);

                    if(!dither) continue;

                    const quant_error = Color.sub(oldPixel, newPixel);

                    for(const offset of offsets) {
                        const dx = x + offset.x;
                        const dy = y + offset.y;
                        if(!img.isInBounds(dx, dy)) continue;
                        this.set(dx, dy, Color.add(this.get(dx, dy), Color.div(Color.mul(quant_error, offset.mul), totalMul)));
                    }

                }
            }

            return img;
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


}


