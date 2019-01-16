/**
 * @author Paul Scott
 * @version 15 January 2019
 *
 * chip8 emulation code
 *
 */
class Chip8 {

    /**
     * constructor
     */
    constructor() {

        // instance data
        this.opcode = 0x0; // current instruction
        this.I = 0x0; // I pointer
        this.delay = 0; // delay timer
        this.sound = 0; // sound timer
        this.isRunning = false; // emulation running state

        // 4k memory and program counter
        this.memBuffer = new ArrayBuffer(0x1000);
        this.memory = new Uint8Array(this.memBuffer);
        this.PC = 0x200;

        // stack memory
        this.stackBuffer = new ArrayBuffer(0x20);
        this.stack = new Uint16Array(this.stackBuffer);
        this.SP = -1;

        // video memory
        this.dispBuffer = new ArrayBuffer(0x800);
        this.display = new Uint8Array(this.dispBuffer);
        this.height = 32;
        this.width = 64;

        // keypad data
        this.keyBuffer = new ArrayBuffer(0x10);
        this.key = new Uint8Array(this.keyBuffer);

        // registers
        this.regBuffer = new ArrayBuffer(0x10);
        this.V = new Uint8Array(this.regBuffer);
    }

    /**
     * loads program into chip8 memory
     * @param program - chip8 program
     */
    load(program) {
        for (let i = 0; i < program.length; i++)
            this.memory[this.PC + i] = program[i];
        this.loadFont();
    }

    /**
     * changes state of keypad key
     * @param key - specified key
     * @param value - pressed [1] or released [0]
     */
    keypress(key, value) {
        this.key[key] = value;
        this.currentKey = key;
    }

    /**
     * emulation loop
     */
    run() {
        this.isRunning = true;
        let self = this;

        // executes instructions
        requestAnimationFrame(async function step() {
            for (let i = 0; i < 10; i++) {
                if (self.isRunning) {

                    // decodes opcode
                    self.opcode = (self.memory[self.PC] << 8) | (self.memory[self.PC + 1]);
                    self.decode();
                }
            }

            // timer handlers
            if (self.isRunning) {
                if (self.delay > 0) self.delay--;
                if (self.sound > 0) self.sound--;
                requestAnimationFrame(step);
            }
        });
    }

    /**
     * loads chip8 font into memory
     */
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

    /**
     * decodes machine instruction
     */
    decode() {

        // local variables
        let reg1 = (this.opcode >> 8) & 0xF; // register 1
        let reg2 = (this.opcode >> 4) & 0xF; // register 2
        let lo = this.opcode & 0xFF; // lower byte
        let subop = this.opcode & 0xF; // sub-operation
        let temp = 0; // temporary variable

        // decode opcode
        switch (this.opcode & 0xF000) {

            // multifunctional opcode
            case 0x0000:
                switch (lo) {

                    // reset display
                    case 0xE0:
                        this.clearDisplay();
                        break;

                    // return from subroutine
                    case 0xEE:
                        this.PC = this.stack[this.SP];
                        this.SP--;
                        break;
                }
                break;

            // set program counter to lower 3 nibbles of opcode
            case 0x1000:
                this.PC = (this.opcode & 0xFFF) - 2;
                break;

            // jump to subroutine
            case 0x2000:
                this.SP++;
                this.stack[this.SP] = this.PC;
                this.PC = (this.opcode & 0xFFF) - 2;
                break;

            // checks equality of specified register and lower byte of opcode
            case 0x3000:
                if (this.V[reg1] === lo) this.PC += 2;
                break;

            // checks inequality of specified register and lower byte of opcode
            case 0x4000:
                if (this.V[reg1] !== lo) this.PC += 2;
                break;

            // checks equality of two specified registers
            case 0x5000:
                if (this.V[reg1] === this.V[reg2]) this.PC += 2;
                break;

            // sets specified register equal to lower byte of opcode
            case 0x6000:
                this.V[reg1] = lo;
                break;

            // sets specified register equal to itself
            // plus lower byte of opcode
            case 0x7000:
                this.V[reg1] += lo;
                break;

            // multifunctional opcode
            case 0x8000:
                switch (subop) {

                    // sets specified register equal to another specified register
                    case 0x0:
                        this.V[reg1] = this.V[reg2];
                        break;

                    // ors two registers together
                    case 0x1:
                        this.V[reg1] = this.V[reg1] | this.V[reg2];
                        break;

                    // ands two registers together
                    case 0x2:
                        this.V[reg1] = this.V[reg1] & this.V[reg2];
                        break;

                    // xors two registers together
                    case 0x3:
                        this.V[reg1] = this.V[reg1] ^ this.V[reg2];
                        break;

                    // adds two registers together
                    // register 16 set to 1 if sum
                    // is greater than 255
                    case 0x4:
                        temp = this.V[reg1] + this.V[reg2];
                        if (temp > 0xFF) this.V[0xF] = 1;
                        else this.V[0xF] = 0;
                        this.V[reg1] = temp;
                        break;

                    // subtracts two registers together
                    // register 15 set to 0 if difference
                    // is less than 0
                    case 0x5:
                        temp = this.V[reg1] - this.V[reg2];
                        if (temp < 0) this.V[0xF] = 0;
                        else this.V[0xF] = 1;
                        this.V[reg1] = temp;
                        break;

                    // shifts specified register to the left by 1 bit
                    // register 15 takes on value of removed bit
                    case 0x6:
                        this.V[0xF] = this.V[reg1] & 0x1;
                        this.V[reg1] >>= 1;
                        break;

                    // subtracts two registers together
                    // (opposite order of opcode 0x8XX5)
                    // register 15 set to 0 if difference
                    // is less than 0
                    case 0x7:
                        temp = this.V[reg2] - this.V[reg1];
                        if (temp < 0) this.V[0xF] = 0;
                        else this.V[0xF] = 1;
                        this.V[reg1] = temp;
                        break;

                    // shifts specified register to the right by 1 bit
                    // register 15 takes on value of removed bit
                    case 0xE:
                        this.V[0xF] = (this.V[reg1] >> 7) & 0x1;
                        this.V[reg1] <<= 1;
                        break;
                }
                break;

            // checks inequality of two specified registers
            case 0x9000:
                if (this.V[reg1] !== this.V[reg2]) this.PC += 2;
                break;

            // sets pointer I to the value of the lower 3 nibbles of opcode
            case 0xA000:
                this.I = this.opcode & 0xFFF;
                break;

            // adds value of lower 3 nibbles of opcode to register 0
            // and sets program counter to the sum
            case 0xB000:
                this.PC = this.V[0x0] + (this.opcode & 0xFFF) - 2;
                break;

            // random number is placed in specified register
            case 0xC000:
                this.V[reg1] = Math.floor(Math.random() * 0x100) & lo;
                break;

            // draws pixels on display
            // register 15 is set to 1 if any pixels
            // are flipped from on to off
            case 0xD000:
                let x = this.V[reg1]; // x value
                let y = this.V[reg2]; // y value
                this.V[0xF] = 0;

                // draws sprite on display
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

            // multifunctional opcode
            case 0xE000:

                switch (lo) {

                    // checks if specified key is pressed
                    case 0x9E:
                        if (this.key[this.V[reg1]] === 1) this.PC += 2;
                        break;

                        // checks if specified key in not pressed
                    case 0xA1:
                        if (this.key[this.V[reg1]] === 0) this.PC += 2;
                        break;
                }
                break;

            // multifunctional opcode
            case 0xF000:

                switch (lo) {

                    // sets specified register to current value of delay timer
                    case 0x07:
                        this.V[reg1] = this.delay;
                        break;

                    // not implemented
                    case 0x0A:
                        break;

                    // sets delay timer equal to value in specified register
                    case 0x15:
                        this.delay = this.V[reg1];
                        break;

                    // sets sound timer equal to value in specified register
                    case 0x18:
                        this.sound = this.V[reg1];
                        break;

                    // sets I pointer equal to itself plus the value
                    // stored in specified register
                    case 0x1E:
                        this.I += this.V[reg1];
                        break;

                    // sets I pointer equal to location of specified font character
                    case 0x29:
                        switch (this.V[reg1]) {

                            // character '0'
                            case 0x0:
                                this.I = 0x00;
                                break;

                            // character '1'
                            case 0x1:
                                this.I = 0x05;
                                break;

                            // character '2'
                            case 0x2:
                                this.I = 0x0A;
                                break;

                            // character '3'
                            case 0x3:
                                this.I = 0x0F;
                                break;

                            // character '4'
                            case 0x4:
                                this.I = 0x14;
                                break;

                            // character '5'
                            case 0x5:
                                this.I = 0x19;
                                break;

                            // character '6'
                            case 0x6:
                                this.I = 0x1E;
                                break;

                            // character '7'
                            case 0x7:
                                this.I = 0x23;
                                break;

                            // character '8'
                            case 0x8:
                                this.I = 0x28;
                                break;

                            // character '9'
                            case 0x9:
                                this.I = 0x2D;
                                break;

                            // character 'A'
                            case 0xA:
                                this.I = 0x32;
                                break;

                            // character 'B'
                            case 0xB:
                                this.I = 0x37;
                                break;

                            // character 'C"
                            case 0xC:
                                this.I = 0x3C;
                                break;

                            // character 'D'
                            case 0xD:
                                this.I = 0x41;
                                break;

                            // character 'E"
                            case 0xE:
                                this.I = 0x46;
                                break;

                            // character 'F'
                            case 0xF:
                                this.I = 0x4B;
                                break;
                        }
                        break;

                    // stores binary coded decimal representation of value
                    // stored in specified register in memory
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

                    // loads register values up to specified register into memory
                    case 0x55:
                        for (let r = 0; r <= reg1; r++)
                            this.memory[this.I + r] = this.V[r];
                        break;

                    // stores values in memory into registers up to specified register
                    case 0x65:
                        for (let r = 0; r <= reg1; r++)
                            this.V[r] = this.memory[this.I + r];
                        break;
                }
                break;
        }
        this.PC += 2;
    }

    /**
     * resets chip8
     */
    reset() {
        this.opcode = 0x0;
        this.I = 0x0;
        this.delay = 0;
        this.sound = 0;
        this.PC = 0x200;
        this.SP = -1;
        this.clearDisplay();
        this.loadFont();

        // resets memory
        for (let i = 0; i < this.memory.length; i++)
            this.memory[i] = 0x0;

        // resets display
        for (let i = 0; i < this.display.length; i++)
            this.display[i] = 0x0;

        // resets stack, keyboard state, and registers
        for (let i = 0; i < this.stack.length; i++) {
            this.stack[i] = 0x0;
            this.key[i] = 0x0;
            this.V[i] = 0x0;
        }
    }

    /**
     * stop emulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * sets pixel on display
     * @param row - row value
     * @param col - column value
     * @param value - on [1] or off [0]
     * @returns {number} - 1 if pixel switches from on to off, 0 otherwise
     */
    setPixel(row, col, value) {
        if (row >= this.height || row < 0) row %= this.height;
        if (col >= this.width || col < 0) col %= this.width;
        this.display[row*64 + col] ^= value;
        if (this.display[row*64 + col] !== value && value === 1) return 1;
        return 0;
    }

    /**
     * clears display
     */
    clearDisplay() {
        for (let i = 0; i < this.display.length; i++)
            this.display[i] = 0;
    }

    /**
     * draws display
     */
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