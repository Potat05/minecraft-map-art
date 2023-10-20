
/*

    https://github.com/maruohon/litematica/tree/pre-rewrite/fabric/1.20.x

*/

import { NBT_Number, encodeNBT, type NBT_Value, NBT_List, NBT_Tag, NBT_Long_Array } from "./nbt";



export class Block {
    public name: string;
    public props?: {[key: string]: string};

    constructor(name: string, props?: {[key: string]: string}) {
        this.name = name;
        this.props = props;
    }

    public static equals(a: Block, b: Block): boolean {
        if(a.name != b.name) return false;
        if(typeof a.props != typeof b.props) return false;
        if(typeof a.props == 'object' && typeof b.props == 'object') {
            for(const key in a.props) {
                if(!(key in b.props)) return false;
                if(a.props[key] != b.props[key]) return false;
            }
            for(const key in b.props) {
                if(!(key in a.props)) return false;
                if(b.props[key] != a.props[key]) return false;
            }
        }
        return true;
    }

    public nbt(): NBT_Value {
        return (this.props ? {
            Name: this.name,
            Properties: this.props
        } : {
            Name: this.name
        });
    }
}



type Vec = { x: number, y: number, z: number };



export class Region {

    public readonly pos: Vec;
    public readonly size: Vec;
    
    // TODO: Refactor how the palette is handled.
    private palette: Block[];
    private indices: Uint32Array;

    constructor(pos: Vec, size: Vec) {
        this.pos = pos;
        this.size = size;

        // Size is forced positive.
        if(this.size.x < 0) this.pos.x -= this.size.x *= -1;
        if(this.size.y < 0) this.pos.y -= this.size.y *= -1;
        if(this.size.z < 0) this.pos.z -= this.size.z *= -1;

        this.palette = [];
        this.indices = new Uint32Array(this.size.x * this.size.y * this.size.z);
    }

    public containsPos(pos: Vec): boolean {
        if(pos.x < this.pos.x || pos.x >= this.pos.x + this.size.x) return false;
        if(pos.y < this.pos.y || pos.y >= this.pos.y + this.size.y) return false;
        if(pos.z < this.pos.z || pos.z >= this.pos.z + this.size.z) return false;
        return true;
    }

    private getIndex(pos: Vec): number {
        // TODO: This is probably wrong.
        return pos.x + ((pos.y + (this.pos.z) * this.size.y) * this.size.x);
    }

    public set(pos: Vec, block: Block): void {
        if(!this.containsPos(pos)) {
            throw new Error('Cannot set block outside of region.');
        }

        let palInd = this.palette.findIndex(palBlock => Block.equals(palBlock, block));
        if(palInd == -1) {
            palInd = this.palette.length;
            this.palette.push(block);
        }

        this.indices[this.getIndex(pos)] = palInd;
    }



    public nbt(): NBT_Value {

        const numBitsPerBlock = Math.max(Math.ceil(Math.log2(this.palette.length)), 4);
        const numBlocksPerLong = Math.floor(64 / numBitsPerBlock);
        const numBlocks = this.size.x * this.size.y * this.size.z;
        const numLongs = Math.ceil(numBlocks / numBlocksPerLong);
        // TODO: Encode into this.
        const blockStates = new BigInt64Array(numLongs);

        return {
            Position: {
                x: new NBT_Number('Int', this.pos.x),
                y: new NBT_Number('Int', this.pos.y),
                z: new NBT_Number('Int', this.pos.z)
            },
            Size: {
                x: new NBT_Number('Int', this.size.x),
                y: new NBT_Number('Int', this.size.y),
                z: new NBT_Number('Int', this.size.z)
            },
            BlockStatePalette: this.palette.map(block => block.nbt()),
            Entities: new NBT_List(NBT_Tag.Compound, []),
            PendingBlockTicks: new NBT_List(NBT_Tag.Compound, []),
            PendingFluidTicks: new NBT_List(NBT_Tag.Compound, []),
            TileEntities: new NBT_List(NBT_Tag.Compound, []),
            BlockStates: new NBT_Long_Array(blockStates)
        }
    }

}



export class Litematic {

    public regions: {[key: string]: Region} = {};

    public author: string;
    public name: string;
    public description: string;

    constructor(author: string, name: string = 'Unnamed', description: string = '') {
        this.author = author;
        this.name = name;
        this.description = description;
    }

    public nbt(): NBT_Value {
        return {
            Metadata: {
                EnclosingSize: {
                    // TODO: Make this actually correct.
                    x: new NBT_Number('Int', Object.values(this.regions)[0].size.x),
                    y: new NBT_Number('Int', Object.values(this.regions)[0].size.y),
                    z: new NBT_Number('Int', Object.values(this.regions)[0].size.z)
                },
                Author: this.author,
                Description: this.description,
                Name: this.name,
                RegionCount: new NBT_Number('Int', Object.keys(this.regions).length),
                TimeCreated: new NBT_Number('Long', BigInt(Date.now())),
                TimeModified: new NBT_Number('Long', BigInt(Date.now())),
                TotalBlocks: new NBT_Number('Int', 27), // TODO: Calculate total blocks that aren't air.
                TotalVolume: new NBT_Number('Int', 27), // TODO: Calculate total blocks.
            },
            Regions: Object.fromEntries(Object.entries(this.regions).map(([ regionName, region ]) => {
                return [ regionName, region.nbt() ];
            })),
            MinecraftDataVersion: new NBT_Number('Int', 3578), // 1.20.2,
            SubVersion: new NBT_Number('Int', 1),
            Version: new NBT_Number('Int', 6)
        }
    }

    public getFile(): ArrayBuffer {
        return encodeNBT(this.nbt());
    }

}


