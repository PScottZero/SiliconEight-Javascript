class Chip8 {

    constructor() {
        this.opcode = 0x0;
        this.I = 0x0;
        this.delay = 0;
        this.sound = 0;
        this.currentKey = -1;

        this.memory = [];
        this.memory.length = 4096;
        this.PC = 0x200;

        this.stack = [];
        this.stack.length = 16;
        this.SP = -1;

        this.display = [];
        this.display.length = 2048;
        this.height = 32;
        this.width = 64;

        this.key = [];
        this.key.length = 16;

        this.V = [];
        this.V.length = 16;

        for (let i = 0; i < this.memory.length; i++)
            this.memory[i] = 0x0;

        for (let i = 0; i < this.display.length; i++)
            this.display[i] = 0x0;

        for (let i = 0; i < this.stack.length; i++) {
            this.stack[i] = 0x0;
            this.key[i] = 0x0;
            this.V[i] = 0x0;
        }
    }

    load(chip8) {
        let file = document.getElementById("file_selector").files[0];
        let reader = new FileReader();
        reader.onload = function() {
            let result = reader.result;
            for (let i = 0; i < result.length; i++) {
                chip8.memory[i + chip8.PC] = result[i].charCodeAt(0);
            }
            chip8.loadFont(chip8);
        };
        reader.readAsBinaryString(file);
        chip8.isRunning = true;
    }

    keypress(chip8, key, value) {
        chip8.key[key] = value;
        chip8.currentKey = key;
    }

    step(chip8) {
        chip8.opcode = (chip8.memory[chip8.PC] << 8) | (chip8.memory[chip8.PC + 1]);
        chip8.decode(chip8);
        chip8.delay--;
        chip8.sound--;
    }

    loadFont(chip8) {
        let font = Array(
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        );

        for (let i = 0; i < 0x50; i++) chip8.memory[i] = font[i];
    }

    async decode(chip8) {

        let reg1 = (chip8.opcode >> 8) & 0xF;
        let reg2 = (chip8.opcode >> 4) & 0xF;
        let lo = chip8.opcode & 0xFF;
        let subop = chip8.opcode & 0xF;

        console.log(chip8.opcode.toString(16));

        switch (chip8.opcode & 0xF000) {

            case 0x0000:
                switch (lo) {
                    case 0xE0:
                        chip8.clearDisplay(chip8);
                        break;
                    case 0xEE:
                        chip8.PC = chip8.stack[chip8.SP];
                        chip8.SP--;
                        break;
                }
                break;

            case 0x1000:
                chip8.PC = chip8.opcode & 0xFFF;
                chip8.PC -= 2;
                break;

            case 0x2000:
                chip8.SP++;
                chip8.stack[chip8.SP] = chip8.PC;
                chip8.PC = chip8.opcode & 0xFFF;
                chip8.PC -= 2;
                break;

            case 0x3000:
                if (chip8.V[reg1] === lo) chip8.PC += 2;
                break;

            case 0x4000:
                if (chip8.V[reg1] !== lo) chip8.PC += 2;
                break;

            case 0x5000:
                if (chip8.V[reg1] === chip8.V[reg2]) chip8.PC += 2;
                break;

            case 0x6000:
                chip8.V[reg1] = lo;
                break;

            case 0x7000:
                chip8.V[reg1] += lo;
                if (chip8.V[reg1] > 0xFF) chip8.V[reg1] -= 0x100;
                break;
            case 0x8000:
                switch (subop) {

                    case 0x0:
                        chip8.V[reg1] = chip8.V[reg2];
                        break;

                    case 0x1:
                        chip8.V[reg1] = chip8.V[reg1] | chip8.V[reg1];
                        break;

                    case 0x2:
                        chip8.V[reg1] = chip8.V[reg1] & chip8.V[reg2];
                        break;

                    case 0x3:
                        chip8.V[reg1] = chip8.V[reg1] ^ chip8.V[reg2];
                        break;

                    case 0x4:
                        chip8.V[reg1] += chip8.V[reg2];
                        if (chip8.V[reg1] > 0xFF) {
                            chip8.V[0xF] = 1;
                            chip8.V[reg1] -= 0x100;
                        } else chip8.V[0xF] = 0;
                        break;

                    case 0x5:
                        chip8.V[reg1] -= chip8.V[reg2];
                        if (chip8.V[reg1] < 0) {
                            chip8.V[0xF] = 0;
                            chip8.V[reg1] += 0x100;
                        } else chip8.V[0xF] = 1;
                        break;

                    case 0x6:
                        chip8.V[0xF] = chip8.V[reg1] & 0x1;
                        chip8.V[reg1] >>= 1;
                        break;

                    case 0x7:
                        chip8.V[reg1] = chip8.V[reg2] - chip8.V[reg1];
                        if (chip8.V[reg1] < 0) {
                            chip8.V[0xF] = 0;
                            chip8.V[reg1] += 0x100;
                        } else chip8.V[0xF] = 1;
                        break;

                    case 0xE:
                        chip8.V[0xF] = (chip8.V[reg1] >> 7) & 0x1;
                        chip8.V[reg1] <<= 1;
                        break;
                }
                break;

            case 0x9000:
                if (chip8.V[reg1] !== chip8.V[reg2]) chip8.PC += 2;
                break;

            case 0xA000:
                chip8.I = chip8.opcode & 0xFFF;
                break;

            case 0xB000:
                chip8.PC = chip8.V[0x0] + chip8.opcode;
                break;

            case 0xC000:
                chip8.V[reg1] = Math.floor(Math.random() * 0x100) & lo;
                break;

            case 0xD000:
                let x = chip8.V[reg1];
                let y = chip8.V[reg2];
                chip8.V[0xF] = 0;

                for (let r = 0; r < subop; r++) {
                    let bitOffset = 7;
                    for (let c = 0; c < 8; c++) {
                        let flip = chip8.setPixel(chip8, y + r, x + c,
                            (chip8.memory[chip8.I + r] >> bitOffset) & 0x1);
                        chip8.V[0xF] = chip8.V[0xF] | flip;
                        bitOffset--;
                    }
                }
                chip8.draw(chip8);
                break;

            case 0xE000:

                switch (lo) {

                    case 0x9E:
                        if (chip8.key[chip8.V[reg1]] === 1) chip8.PC += 2;
                        break;

                    case 0xA1:
                        if (chip8.key[chip8.V[reg1]] === 0) chip8.PC += 2;
                        break;
                }
                break;

            case 0xF000:

                switch (lo) {

                    case 0x07:
                        chip8.V[reg1] = chip8.delay;
                        break;

                    case 0x0A:
                        chip8.currentKey = -1;
                        while (chip8.currentKey < 0) {
                            await new Promise(resolve => setTimeout(resolve, 2));
                        }
                        chip8.V[reg1] = chip8.currentKey;
                        break;

                    case 0x15:
                        chip8.delay = chip8.V[reg1];
                        break;

                    case 0x18:
                        chip8.sound = chip8.V[reg1];
                        break;

                    case 0x1E:
                        chip8.I += chip8.V[reg1];
                        break;

                    case 0x29:
                        switch (chip8.V[reg1]) {
                            case 0x0:
                                chip8.I = 0x00;
                                break;
                            case 0x1:
                                chip8.I = 0x05;
                                break;
                            case 0x2:
                                chip8.I = 0x0A;
                                break;
                            case 0x3:
                                chip8.I = 0x0F;
                                break;
                            case 0x4:
                                chip8.I = 0x14;
                                break;
                            case 0x5:
                                chip8.I = 0x19;
                                break;
                            case 0x6:
                                chip8.I = 0x1E;
                                break;
                            case 0x7:
                                chip8.I = 0x23;
                                break;
                            case 0x8:
                                chip8.I = 0x28;
                                break;
                            case 0x9:
                                chip8.I = 0x2D;
                                break;
                            case 0xA:
                                chip8.I = 0x32;
                                break;
                            case 0xB:
                                chip8.I = 0x37;
                                break;
                            case 0xC:
                                chip8.I = 0x3C;
                                break;
                            case 0xD:
                                chip8.I = 0x41;
                                break;
                            case 0xE:
                                chip8.I = 0x46;
                                break;
                            case 0xF:
                                chip8.I = 0x4B;
                                break;
                        }
                        break;

                    case 0x33:
                        let regVal = chip8.V[reg1];
                        let bcd1 = regVal % 10;
                        regVal /= 10;
                        let bcd2 = regVal % 10;
                        let bcd3 = regVal / 10;
                        chip8.memory[chip8.I] = bcd3;
                        chip8.memory[chip8.I + 1] = bcd2;
                        chip8.memory[chip8.I + 2] = bcd1;
                        break;

                    case 0x55:
                        for (let r = 0; r <= reg1; r++)
                            chip8.memory[chip8.I + r] = chip8.V[r];
                        break;

                    case 0x65:
                        for (let r = 0; r <= reg1; r++)
                            chip8.V[r] = chip8.memory[chip8.I + r];
                        break;
                }
                break;
        }
        chip8.PC += 2;
    }

    clear(chip8) {
        chip8.opcode = 0x0;
        chip8.I = 0x0;
        chip8.delay = 0;
        chip8.sound = 0;
        chip8.PC = 0x200;
        chip8.SP = -1;
        chip8.clearDisplay(chip8);

        for (let i = 0; i < chip8.memory.length; i++)
            chip8.memory[i] = 0x0;

        for (let i = 0; i < chip8.display.length; i++)
            chip8.display[i] = 0x0;

        for (let i = 0; i < chip8.stack.length; i++) {
            chip8.stack[i] = 0x0;
            chip8.key[i] = 0x0;
            chip8.V[i] = 0x0;
        }
    }

    setPixel(chip8, row, col, value) {
        if (row >= chip8.height || row < 0) row %= chip8.height;
        if (col >= chip8.width || col < 0) col %= chip8.width;
        chip8.display[row*64 + col] ^= value;
        if (chip8.display[row*64 + col] !== value && value === 1) return 1;
        return 0;
    }

    clearDisplay(chip8) {
        for (let i = 0; i < chip8.display.length; i++)
            chip8.display[i] = 0;
    }

    draw(chip8) {
        let canvas = document.getElementById("chip8");
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        for (let i = 0; i < chip8.display.length; i++) {
            if (chip8.display[i] === 1)
                ctx.fillStyle = "#4fff95";
            else
                ctx.fillStyle = "#000";
            ctx.fillRect((i % 64) * 5, Math.floor(i / 64) * 5, 5, 5);
        }
    }
}