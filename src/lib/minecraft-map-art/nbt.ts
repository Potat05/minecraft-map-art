
import * as pako from "pako";



export enum NBT_Tag {
    End = 0,
    Byte = 1,
    Short = 2,
    Int = 3,
    Long = 4,
    Float = 5,
    Double = 6,
    Byte_Array = 7,
    String = 8,
    List = 9,
    Compound = 10,
    Int_Array = 11,
    Long_Array = 12
}



interface NBT_ValueBase {
    readonly tag: NBT_Tag;
    encode(): ArrayBuffer;
}



const NBT_NumberTagTypes = {
    'Byte': NBT_Tag.Byte,
    'Short': NBT_Tag.Short,
    'Int': NBT_Tag.Int,
    'Long': NBT_Tag.Long,
    'Float': NBT_Tag.Float,
    'Double': NBT_Tag.Double
}

interface NBT_NumberNumberTypes {
    'Byte': number;
    'Short': number;
    'Int': number;
    'Long': bigint;
    'Float': number;
    'Double': number;
}

const NBT_NumberArrayTypes = {
    [NBT_Tag.Byte]: Int8Array,
    [NBT_Tag.Short]: Int16Array,
    [NBT_Tag.Int]: Int32Array,
    [NBT_Tag.Long]: BigInt64Array,
    [NBT_Tag.Float]: Float32Array,
    [NBT_Tag.Double]: Float64Array
}

export class NBT_Number<NumType extends keyof typeof NBT_NumberTagTypes> implements NBT_ValueBase {
    public readonly tag: typeof NBT_NumberTagTypes[NumType];

    public number: NBT_NumberNumberTypes[NumType];
    constructor(type: NumType, value: NBT_NumberNumberTypes[NumType]) {
        this.tag = NBT_NumberTagTypes[type];
        this.number = value;
    }

    public encode(): ArrayBuffer {
        // @ts-ignore - TODO: Don't require this ts-ignore.
        const buffer = new NBT_NumberArrayTypes[this.tag]([ this.number ]).buffer;
        const reversed = new Uint8Array(buffer).reverse();
        return reversed.buffer;
    }
}

export class NBT_String implements NBT_ValueBase {
    public readonly tag = NBT_Tag.String;

    public str: string;
    constructor(str: string) {
        this.str = str;
    }

    public encode(): ArrayBuffer {
        const encoded = new TextEncoder().encode(this.str);
        return joinBuffers([
            new Uint8Array([
                encoded.byteLength << 8,
                encoded.byteLength
            ]).buffer, encoded.buffer
        ]);
    }
}

export class NBT_Byte_Array implements NBT_ValueBase {
    public readonly tag = NBT_Tag.Byte_Array;

    readonly array: Int8Array;
    constructor(array: Int8Array) {
        this.array = array;
    }

    public encode(): ArrayBuffer {
        return joinBuffers([ new NBT_Number('Int', this.array.length).encode(), this.array.buffer ]);
    }
}

export class NBT_Int_Array implements NBT_ValueBase {
    public readonly tag = NBT_Tag.Int_Array;

    readonly array: Int32Array;
    constructor(array: Int32Array) {
        this.array = array;
    }

    public encode(): ArrayBuffer {
        const encoded = new ArrayBuffer(this.array.byteLength);
        const view = new DataView(encoded);
        for(let i = 0; i < this.array.length; i++) {
            view.setInt32(i * this.array.BYTES_PER_ELEMENT, this.array[i], false);
        }
        return joinBuffers([ new NBT_Number('Int', this.array.length).encode(), encoded ]);
    }
}

export class NBT_Long_Array implements NBT_ValueBase {
    public readonly tag = NBT_Tag.Long_Array;

    readonly array: BigInt64Array;
    constructor(array: BigInt64Array) {
        this.array = array;
    }

    public encode(): ArrayBuffer {
        const encoded = new ArrayBuffer(this.array.byteLength);
        const view = new DataView(encoded);
        for(let i = 0; i < this.array.length; i++) {
            view.setBigInt64(i * this.array.BYTES_PER_ELEMENT, this.array[i], false);
        }
        return joinBuffers([ new NBT_Number('Int', this.array.length).encode(), encoded ]);
    }
}

export class NBT_Compound<T extends {[key: string]: NBT_Value}> implements NBT_ValueBase {
    public readonly tag = NBT_Tag.Compound;

    public obj: T;
    constructor(obj: T) {
        this.obj = obj;
    }

    public encode(): ArrayBuffer {

        let buffers: ArrayBuffer[] = [ ];

        for(let [ key, _value ] of Object.entries(this.obj)) {

            const value = NBTBase(_value);

            const encodedValue = value.encode();

            const encodedKey = new TextEncoder().encode(key).buffer;
            const identBuf = new Uint8Array([
                value.tag,
                encodedKey.byteLength << 8,
                encodedKey.byteLength
            ]).buffer;

            buffers.push( identBuf, encodedKey, encodedValue );

        }

        buffers.push(new Uint8Array([ NBT_Tag.End ]).buffer);

        return joinBuffers(buffers);

    }
}

export class NBT_List<Tag extends NBT_Tag> implements NBT_ValueBase {
    public readonly tag = NBT_Tag.List;

    public readonly listTag: Tag;
    public list: NBT_Values[Tag][];
    constructor(listTag: Tag, list: NBT_Values[Tag][]) {
        this.listTag = listTag;
        this.list = list;
    }

    public encode(): ArrayBuffer {
        
        let buffers: ArrayBuffer[] = [];

        buffers.push(new Uint8Array([
            // this.listTag == NBT_Tag.Compound ?? this.list.length == 0 ? NBT_Tag.End : this.listTag,
            this.listTag,
            this.list.length << 24,
            this.list.length << 16,
            this.list.length << 8,
            this.list.length,
        ]).buffer);

        this.list.forEach(item => {
            buffers.push(NBTBase(item).encode());
        });

        return joinBuffers(buffers);

    }
}





function NBTBase(value: NBT_Value): NBT_ValueBase {
    if(typeof value == 'string') {
        return new NBT_String(value);
    }
    if(typeof value == 'boolean') {
        return new NBT_Number('Byte', value ? 1 : 0);
    }
    if(
        !(value instanceof NBT_Number) &&
        !(value instanceof NBT_String) &&
        !(value instanceof NBT_Byte_Array) &&
        !(value instanceof NBT_Int_Array) &&
        !(value instanceof NBT_Long_Array) &&
        !(value instanceof NBT_List) &&
        !(value instanceof NBT_Compound)
    ) {
        if(Array.isArray(value)) {

            // TODO: Optimize this shit, don't call NBTBase to just get the tag.

            if(value.length == 0) {
                throw new Error('Cannot infer nbt list type from empty list, Please use NBT_List instead of [].');
            }

            const tag = NBTBase(value[0]).tag;
            // @ts-ignore - TODO: Don't use ts-ignore here.
            return new NBT_List(tag, value.map(item => {
                const base = NBTBase(item);
                if(base.tag != tag) {
                    throw new Error('List items do not match tags.');
                }
                return base;
            }));

        } else {
            return new NBT_Compound(value);
        }
    }
    return value;
}

export interface NBT_Values {
    [NBT_Tag.End]: never;
    [NBT_Tag.Byte]: NBT_Number<'Byte'>;
    [NBT_Tag.Short]: NBT_Number<'Short'>;
    [NBT_Tag.Int]: NBT_Number<'Int'>;
    [NBT_Tag.Long]: NBT_Number<'Long'>;
    [NBT_Tag.Float]: NBT_Number<'Float'>;
    [NBT_Tag.Double]: NBT_Number<'Double'>;
    [NBT_Tag.String]: NBT_String;
    [NBT_Tag.Byte_Array]: NBT_Byte_Array;
    [NBT_Tag.Int_Array]: NBT_Int_Array;
    [NBT_Tag.Long_Array]: NBT_Long_Array;
    [NBT_Tag.List]: NBT_List<any>;
    [NBT_Tag.Compound]: NBT_Compound<any>;
}

export type NBT_Value = NBT_Values[keyof NBT_Values]
     | string
     | boolean
     | Array<NBT_Value>
     | {[key: string]: NBT_Value};





function joinBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    const totalLength = buffers.reduce((length, buffer) => length + buffer.byteLength, 0);
    const joined = new Uint8Array(totalLength);

    buffers.reduce((offset, buffer) => {
        joined.set(new Uint8Array(buffer), offset);
        return offset + buffer.byteLength;
    }, 0);

    return joined;
}



export function encodeNBT(nbt: ArrayBuffer | NBT_Value, gzip: boolean = true): ArrayBuffer {
    if(!(nbt instanceof ArrayBuffer)) {
        nbt = NBTBase(nbt).encode();
        nbt = joinBuffers([new Uint8Array([
            NBT_Tag.Compound,
            0, 0
        ]), nbt]);
    }

    if(!gzip) return nbt;
    return pako.gzip(nbt).buffer;
}


