class Chip8 {

    constructor() {
        this.opcode = 0x0;
        this.I = 0x0;
        this.delay = 0;
        this.sound = 0;
        this.currentKey = -1;
        this.isRunning = false;

        this.memBuffer = new ArrayBuffer(0x1000);
        this.memory = new Uint8Array(this.memBuffer);
        this.PC = 0x200;

        this.loadFont();

        this.stackBuffer = new ArrayBuffer(0x20);
        this.stack = new Uint16Array(this.stackBuffer);
        this.SP = -1;

        this.dispBuffer = new ArrayBuffer(0x800);
        this.display = new Uint8Array(this.dispBuffer);
        this.height = 32;
        this.width = 64;

        this.keyBuffer = new ArrayBuffer(0x10);
        this.key = new Uint8Array(this.keyBuffer);

        this.regBuffer = new ArrayBuffer(0x10);
        this.V = new Uint8Array(this.regBuffer);
    }

    load(program) {
        for (let i = 0; i < program.length; i++)
            this.memory[this.PC + i] = program[i];
        this.loadFont();
    }

    keypress(key, value) {
        this.key[key] = value;
        this.currentKey = key;
    }

    run() {
        this.isRunning = true;
        let self = this;
        requestAnimationFrame(async function step() {
            for (let i = 0; i < 10; i++) {
                if (self.isRunning) {
                    self.opcode = (self.memory[self.PC] << 8) | (self.memory[self.PC + 1]);
                    self.decode();
                }
            }
            if (self.isRunning) {
                if (self.delay > 0) self.delay--;
                if (self.sound > 0) self.sound--;
                requestAnimationFrame(step);
            }
        });
    }

    loadFont() {
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

        for (let i = 0; i < 0x50; i++) this.memory[i] = font[i];
    }

    decode() {

        let reg1 = (this.opcode >> 8) & 0xF;
        let reg2 = (this.opcode >> 4) & 0xF;
        let lo = this.opcode & 0xFF;
        let subop = this.opcode & 0xF;
        let temp = 0;

        switch (this.opcode & 0xF000) {

            case 0x0000:
                switch (lo) {
                    case 0xE0:
                        this.clearDisplay();
                        break;
                    case 0xEE:
                        this.PC = this.stack[this.SP];
                        this.SP--;
                        break;
                }
                break;

            case 0x1000:
                this.PC = (this.opcode & 0xFFF) - 2;
                break;

            case 0x2000:
                this.SP++;
                this.stack[this.SP] = this.PC;
                this.PC = (this.opcode & 0xFFF) - 2;
                break;

            case 0x3000:
                if (this.V[reg1] === lo) this.PC += 2;
                break;

            case 0x4000:
                if (this.V[reg1] !== lo) this.PC += 2;
                break;

            case 0x5000:
                if (this.V[reg1] === this.V[reg2]) this.PC += 2;
                break;

            case 0x6000:
                this.V[reg1] = lo;
                break;

            case 0x7000:
                this.V[reg1] += lo;
                break;

            case 0x8000:
                switch (subop) {

                    case 0x0:
                        this.V[reg1] = this.V[reg2];
                        break;

                    case 0x1:
                        this.V[reg1] = this.V[reg1] | this.V[reg2];
                        break;

                    case 0x2:
                        this.V[reg1] = this.V[reg1] & this.V[reg2];
                        break;

                    case 0x3:
                        this.V[reg1] = this.V[reg1] ^ this.V[reg2];
                        break;

                    case 0x4:
                        temp = this.V[reg1] + this.V[reg2];
                        if (temp > 0xFF) this.V[0xF] = 1;
                        else this.V[0xF] = 0;
                        this.V[reg1] = temp;
                        break;

                    case 0x5:
                        temp = this.V[reg1] - this.V[reg2];
                        if (temp < 0) this.V[0xF] = 0;
                        else this.V[0xF] = 1;
                        this.V[reg1] = temp;
                        break;

                    case 0x6:
                        this.V[0xF] = this.V[reg1] & 0x1;
                        this.V[reg1] >>= 1;
                        break;

                    case 0x7:
                        temp = this.V[reg2] - this.V[reg1];
                        if (temp < 0) this.V[0xF] = 0;
                        else this.V[0xF] = 1;
                        this.V[reg1] = temp;
                        break;

                    case 0xE:
                        this.V[0xF] = (this.V[reg1] >> 7) & 0x1;
                        this.V[reg1] <<= 1;
                        break;
                }
                break;

            case 0x9000:
                if (this.V[reg1] !== this.V[reg2]) this.PC += 2;
                break;

            case 0xA000:
                this.I = this.opcode & 0xFFF;
                break;

            case 0xB000:
                this.PC = this.V[0x0] + (this.opcode & 0xFFF) - 2;
                break;

            case 0xC000:
                this.V[reg1] = Math.floor(Math.random() * 0x100) & lo;
                break;

            case 0xD000:
                let x = this.V[reg1];
                let y = this.V[reg2];
                this.V[0xF] = 0;

                for (let r = 0; r < subop; r++) {
                    let bitOffset = 7;
                    for (let c = 0; c < 8; c++) {
                        let flip = this.setPixel(y + r, x + c,
                            (this.memory[this.I + r] >> bitOffset) & 0x1);
                        this.V[0xF] = this.V[0xF] | flip;
                        bitOffset--;
                    }
                }
                this.draw();
                break;

            case 0xE000:

                switch (lo) {

                    case 0x9E:
                        if (this.key[this.V[reg1]] === 1) this.PC += 2;
                        break;

                    case 0xA1:
                        if (this.key[this.V[reg1]] === 0) this.PC += 2;
                        break;
                }
                break;

            case 0xF000:

                switch (lo) {

                    case 0x07:
                        this.V[reg1] = this.delay;
                        break;

                    case 0x0A:
                        this.V[reg1] = this.currentKey;
                        break;

                    case 0x15:
                        this.delay = this.V[reg1];
                        break;

                    case 0x18:
                        this.sound = this.V[reg1];
                        break;

                    case 0x1E:
                        this.I += this.V[reg1];
                        break;

                    case 0x29:
                        switch (this.V[reg1]) {
                            case 0x0:
                                this.I = 0x00;
                                break;
                            case 0x1:
                                this.I = 0x05;
                                break;
                            case 0x2:
                                this.I = 0x0A;
                                break;
                            case 0x3:
                                this.I = 0x0F;
                                break;
                            case 0x4:
                                this.I = 0x14;
                                break;
                            case 0x5:
                                this.I = 0x19;
                                break;
                            case 0x6:
                                this.I = 0x1E;
                                break;
                            case 0x7:
                                this.I = 0x23;
                                break;
                            case 0x8:
                                this.I = 0x28;
                                break;
                            case 0x9:
                                this.I = 0x2D;
                                break;
                            case 0xA:
                                this.I = 0x32;
                                break;
                            case 0xB:
                                this.I = 0x37;
                                break;
                            case 0xC:
                                this.I = 0x3C;
                                break;
                            case 0xD:
                                this.I = 0x41;
                                break;
                            case 0xE:
                                this.I = 0x46;
                                break;
                            case 0xF:
                                this.I = 0x4B;
                                break;
                        }
                        break;

                    case 0x33:
                        let regVal = this.V[reg1];
                        let bcd1 = regVal % 10;
                        regVal /= 10;
                        let bcd2 = regVal % 10;
                        let bcd3 = regVal / 10;
                        this.memory[this.I] = bcd3;
                        this.memory[this.I + 1] = bcd2;
                        this.memory[this.I + 2] = bcd1;
                        break;

                    case 0x55:
                        for (let r = 0; r <= reg1; r++)
                            this.memory[this.I + r] = this.V[r];
                        break;

                    case 0x65:
                        for (let r = 0; r <= reg1; r++)
                            this.V[r] = this.memory[this.I + r];
                        break;
                }
                break;
        }
        this.PC += 2;
    }

    clear() {
        this.opcode = 0x0;
        this.I = 0x0;
        this.delay = 0;
        this.sound = 0;
        this.PC = 0x200;
        this.SP = -1;
        this.clearDisplay();
        this.loadFont();

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

    stop() {
        this.isRunning = false;
    }

    setPixel(row, col, value) {
        if (row >= this.height || row < 0) row %= this.height;
        if (col >= this.width || col < 0) col %= this.width;
        this.display[row*64 + col] ^= value;
        if (this.display[row*64 + col] !== value && value === 1) return 1;
        return 0;
    }

    clearDisplay() {
        for (let i = 0; i < this.display.length; i++)
            this.display[i] = 0;
    }

    draw() {
        let canvas = document.getElementById("chip8");
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        for (let i = 0; i < this.display.length; i++) {
            if (this.display[i] === 1)
                ctx.fillStyle = "#4fff95";
            else
                ctx.fillStyle = "#000";
            ctx.fillRect((i % 64) * 5, Math.floor(i / 64) * 5, 5, 5);
        }
    }
}