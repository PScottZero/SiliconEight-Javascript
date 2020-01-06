import {Component, HostListener, OnInit} from '@angular/core';
import {LoadRomService} from '../../services/load-rom.service';

const VIDEO_WIDTH = 64;
const VIDEO_HEIGHT = 32;
const MEM_SIZE = 0x1000;
const REGISTER_COUNT = 16;
const KEY_COUNT = 16;
const PC_START = 0x200;

const FONT_DATA = [
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
];

@Component({
  selector: 'app-emulator',
  templateUrl: './emulator.component.html',
  styleUrls: ['./emulator.component.scss']
})
export class EmulatorComponent implements OnInit {

  // registers
  V = new Uint8Array(new ArrayBuffer(REGISTER_COUNT));
  PC = PC_START;
  I = 0;

  // memory
  mem = new Uint8Array(new ArrayBuffer(MEM_SIZE));
  stack: number[] = [];
  vram = new Uint8Array(new Array(VIDEO_WIDTH * VIDEO_HEIGHT));

  // keypad array
  keypad = new Uint8Array(new ArrayBuffer(KEY_COUNT));

  // timers
  delay = 0;
  sound = 0;

  waitingForKeypress = false;

  runInterval;
  delayInterval;

  keys = [
    0x1, 0x2, 0x3, 0xC,
    0x4, 0x5, 0x6, 0xD,
    0x7, 0x8, 0x9, 0xE,
    0xA, 0x0, 0xB, 0xF
  ];

  constructor(private loadRomService: LoadRomService) {}

  ngOnInit() {
    this.loadRomService.onloadFunction = async () => {
      this.reset();
      const response = new Uint8Array(this.loadRomService.xhr.response);
      for (let i = 0; i < response.length; i++) {
        this.mem[i + PC_START] = response[i];
      }
      this.loadFont();
      this.runInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
          this.run();
        }
      }, 1);
      this.delayInterval = setInterval(() => {
        this.decrementTimers();
      }, 16);
    };
  }

  loadFont() {
    for (let i = 0; i < 0x50; i++) {
      this.mem[i] = FONT_DATA[i];
    }
  }

  run() {
    if (!this.waitingForKeypress) {
      const opcode = this.mem[this.PC] << 8 | this.mem[this.PC + 1];
      this.decode(opcode);
    }
  }

  decrementTimers() {
    if (this.delay > 0) {
      this.delay--;
    }
    if (this.sound > 0) {
      this.sound--;
    }
  }

  // decodes machine instruction
  async decode(opcode: number) {

    // local variables
    const reg1 = (opcode >> 8) & 0xF; // register 1
    const reg2 = (opcode >> 4) & 0xF; // register 2
    const loByte = opcode & 0xFF; // lower byte
    const loNibble = opcode & 0xF; // sub-operation
    let temp: number; // temporary variable

    // decode opcode
    switch (opcode & 0xF000) {

      // multifunctional opcode
      case 0x0000:
        switch (loByte) {

          // reset display
          case 0xE0:
            this.clearVRAM();
            break;

          // return from subroutine
          case 0xEE:
            this.PC = this.stack.pop();
            break;
        }
        break;

      // set program counter to lower 3 nibbles of opcode
      case 0x1000:
        this.PC = (opcode & 0xFFF) - 2;
        break;

      // jump to subroutine
      case 0x2000:
        this.stack.push(this.PC);
        this.PC = (opcode & 0xFFF) - 2;
        break;

      // checks equality of specified register and lower byte of opcode
      case 0x3000:
        if (this.V[reg1] === loByte) {
          this.PC += 2;
        }
        break;

      // checks inequality of specified register and lower byte of opcode
      case 0x4000:
        if (this.V[reg1] !== loByte) {
          this.PC += 2;
        }
        break;

      // checks equality of two specified registers
      case 0x5000:
        if (this.V[reg1] === this.V[reg2]) {
          this.PC += 2;
        }
        break;

      // sets specified register equal to lower byte of opcode
      case 0x6000:
        this.V[reg1] = loByte;
        break;

      // sets specified register equal to itself
      // plus lower byte of opcode
      case 0x7000:
        this.V[reg1] += loByte;
        break;

      // multifunctional opcode
      case 0x8000:
        switch (loNibble) {

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
            if (temp > 0xFF) {
              this.V[0xF] = 1;
            } else {
              this.V[0xF] = 0;
            }
            this.V[reg1] = temp;
            break;

          // subtracts two registers together
          // register 15 set to 0 if difference
          // is less than 0
          case 0x5:
            temp = this.V[reg1] - this.V[reg2];
            if (temp < 0) {
              this.V[0xF] = 0;
            } else {
              this.V[0xF] = 1;
            }
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
            if (temp < 0) {
              this.V[0xF] = 0;
            } else {
              this.V[0xF] = 1;
            }
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
        if (this.V[reg1] !== this.V[reg2]) {
          this.PC += 2;
        }
        break;

      // sets pointer I to the value of the lower 3 nibbles of opcode
      case 0xA000:
        this.I = opcode & 0xFFF;
        break;

      // adds value of lower 3 nibbles of opcode to register 0
      // and sets program counter to the sum
      case 0xB000:
        this.PC = this.V[0x0] + (opcode & 0xFFF) - 2;
        break;

      // random number is placed in specified register
      case 0xC000:
        this.V[reg1] = Math.floor(Math.random() * 0x100) & loByte;
        break;

      // draws pixels on display
      // register 15 is set to 1 if any pixels
      // are flipped from on to off
      case 0xD000:
        const x = this.V[reg1]; // x value
        const y = this.V[reg2]; // y value
        this.V[0xF] = 0;

        // draws sprite on display
        for (let r = 0; r < loNibble; r++) {
          let bitOffset = 7;
          for (let c = 0; c < 8; c++) {
            const flip = this.setPixel(x + c, y + r,
              (this.mem[this.I + r] >> bitOffset) & 0x1);
            this.V[0xF] = this.V[0xF] | flip;
            bitOffset--;
          }
        }
        this.draw();
        break;

      // multifunctional opcode
      case 0xE000:

        switch (loByte) {

          // checks if specified key is pressed
          case 0x9E:
            if (this.keypad[this.V[reg1]] === 1) {
              this.PC += 2;
            }
            break;

          // checks if specified key in not pressed
          case 0xA1:
            if (this.keypad[this.V[reg1]] === 0) {
              this.PC += 2;
            }
            break;
        }
        break;

      // multifunctional opcode
      case 0xF000:

        switch (loByte) {

          // sets specified register to current value of delay timer
          case 0x07:
            this.V[reg1] = this.delay;
            break;

          // waits for key input
          case 0x0A:
            let index = -1;
            this.waitingForKeypress = true;
            while (index < 0 && this.waitingForKeypress) {
              index = this.keypad.indexOf(1);
              await this.sleep(1);
            }
            while (this.keypad[index] === 1 && this.waitingForKeypress) {
              await this.sleep(1);
            }
            this.keypad[index] = 0;
            this.V[reg1] = index;
            this.waitingForKeypress = false;
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
            this.I = 0x5 * this.V[reg1];
            break;

          // stores binary coded decimal representation of value
          // stored in specified register in memory
          case 0x33:
            let regVal = this.V[reg1];
            const bcd1 = regVal % 10;
            regVal /= 10;
            const bcd2 = regVal % 10;
            const bcd3 = regVal / 10;
            this.mem[this.I] = bcd3;
            this.mem[this.I + 1] = bcd2;
            this.mem[this.I + 2] = bcd1;
            break;

          // loads register values up to specified register into memory
          case 0x55:
            for (let r = 0; r <= reg1; r++) {
              this.mem[this.I + r] = this.V[r];
            }
            break;

          // stores values in memory into registers up to specified register
          case 0x65:
            for (let r = 0; r <= reg1; r++) {
              this.V[r] = this.mem[this.I + r];
            }
            break;
        }
        break;
    }
    this.PC += 2;
  }

  reset() {
    this.waitingForKeypress = false;
    this.I = 0x0;
    this.delay = 0;
    this.sound = 0;
    this.PC = 0x200;
    this.stack = [];
    this.clearRAM();
    this.clearVRAM();
    this.clearKeypad();
    this.clearRegisters();
    clearInterval(this.runInterval);
    clearInterval(this.delayInterval);
  }

  /**
   * draw display
   */
  draw() {
    const canvas = document.getElementById('chip8') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    for (let i = 0; i < this.vram.length; i++) {
      if (this.vram[i] === 1) {
        ctx.fillStyle = '#FFF';
      } else {
        ctx.fillStyle = '#000';
      }
      ctx.fillRect((i % 64) * 5, Math.floor(i / 64) * 5, 5, 5);
    }
  }

  /**
   * set pixel on display
   */
  setPixel(x, y, value) {

    // vertical wrap
    if (y >= VIDEO_HEIGHT || y < 0) {
      y %= VIDEO_HEIGHT;
    }

    // horizontal wrap
    if (x >= VIDEO_WIDTH || x < 0) {
      x %= VIDEO_WIDTH;
    }

    // set pixel
    this.vram[y * 64 + x] ^= value;
    if (this.vram[y * 64 + x] !== value && value === 1) {
      return 1;
    }
    return 0;
  }

  clearVRAM() {
    for (let i = 0; i < this.vram.length; i++) {
      this.vram[i] = 0;
    }
  }

  clearRAM() {
    for (let i = 0; i < this.mem.length; i++) {
      this.mem[i] = 0x0;
    }
  }

  clearKeypad() {
    for (let i = 0; i < KEY_COUNT; i++) {
      this.keypad[i] = 0x0;
    }
  }

  clearRegisters() {
    for (let i = 0; i < REGISTER_COUNT; i++) {
      this.V[i] = 0x0;
    }
  }

  // pause emulation
  sleep(ns: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ns));
  }

  keypress(key: number, value: number) {
    this.keypad[key] = value;
  }

  // key down listener
  @HostListener('window:keydown', ['$event'])
  keyDown(event: KeyboardEvent) {
    switch (event.key) {
      case '1':
        this.keypress(0x1, 1);
        break;
      case '2':
        this.keypress(0x2, 1);
        break;
      case '3':
        this.keypress(0x3, 1);
        break;
      case '4':
        this.keypress(0xC, 1);
        break;
      case 'q':
        this.keypress(0x4, 1);
        break;
      case 'w':
        this.keypress(0x5, 1);
        break;
      case 'e':
        this.keypress(0x6, 1);
        break;
      case 'r':
        this.keypress(0xD, 1);
        break;
      case 'a':
        this.keypress(0x7, 1);
        break;
      case 's':
        this.keypress(0x8, 1);
        break;
      case 'd':
        this.keypress(0x9, 1);
        break;
      case 'f':
        this.keypress(0xE, 1);
        break;
      case 'z':
        this.keypress(0xA, 1);
        break;
      case 'x':
        this.keypress(0x0, 1);
        break;
      case 'c':
        this.keypress(0xB, 1);
        break;
      case 'v':
        this.keypress(0xF, 1);
        break;
    }
  }

  // key up listener
  @HostListener('window:keyup', ['$event'])
  keyUp(event: KeyboardEvent) {
    switch (event.key) {
      case '1':
        this.keypress(0x1, 0);
        break;
      case '2':
        this.keypress(0x2, 0);
        break;
      case '3':
        this.keypress(0x3, 0);
        break;
      case '4':
        this.keypress(0xC, 0);
        break;
      case 'q':
        this.keypress(0x4, 0);
        break;
      case 'w':
        this.keypress(0x5, 0);
        break;
      case 'e':
        this.keypress(0x6, 0);
        break;
      case 'r':
        this.keypress(0xD, 0);
        break;
      case 'a':
        this.keypress(0x7, 0);
        break;
      case 's':
        this.keypress(0x8, 0);
        break;
      case 'd':
        this.keypress(0x9, 0);
        break;
      case 'f':
        this.keypress(0xE, 0);
        break;
      case 'z':
        this.keypress(0xA, 0);
        break;
      case 'x':
        this.keypress(0x0, 0);
        break;
      case 'c':
        this.keypress(0xB, 0);
        break;
      case 'v':
        this.keypress(0xF, 0);
        break;
    }
  }
}
