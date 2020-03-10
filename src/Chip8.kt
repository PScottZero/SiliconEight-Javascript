/**
 * @author Paul J. Scott
 * @version 5 November 2018
 *
 * This class represents the Chip-8 System.
 * The class is run as a separate thread
 */

import java.io.File

import java.util.*

// chip-8 emulator class
class Chip8: Thread() {

    // machine instruction
    private var opcode =  0

    // registers
    private var v = IntArray(16) // 8 bit registers
    private var i = 0 // memory address register
    private var pc = 0x200 // program counter

    // stack
    private var stack = IntArray(16)
    private var sp = 0 // stack pointer

    // memory
    private var mem = IntArray(4096)

    // timers
    private var delay = 0
    private var sound = 0

    companion object {
        // key status
        private var key = IntArray(16)

        // clock speeds
        private var clockSpeed: Long = 2
        private var clockNano = 0

        // key pressed state for 0xFX0A instruction
        private var keyPressed = -1

        // sets state of keys when pressed or released
        fun setKey(index: Int, value: Int) { key[index] = value }

        // sets state of key for 0xFX0A instruction
        fun setKeyPressed(value: Int) { keyPressed = value }

        // sets program running speed
        fun setClockSpeed(speed: Double) {
            clockSpeed = Math.floor(speed).toLong()
            clockNano = ((speed - clockSpeed) * 1000000).toInt()
        }
    }

    // loads fonts into memory when emulator begins
    init { loadFont() }

    /**
     * runs chip-8 emulator
     */
    override fun run() {
        load(Emulator.file)
        val timer = Timer()
        timer.schedule(DecrementTimers(), 0, 17)
        while (!Emulator.stop) {
            if(!Emulator.pause) {
                opcode = ((mem[pc] shl 8) or (mem[pc+1] and 0xFF)) and 0xFFFF
                decode()
                Thread.sleep(clockSpeed, clockNano)
            }
            Emulator.display.repaint()
        }
        timer.cancel()
        interrupt()
    }

    /**
     * loads program into memory
     * @param file directory of chip-8 program
     */
    private fun load(file: String) {
        reset()
        if (file == "") {
            val startup = javaClass.getResourceAsStream("ch8/startup.ch8")
            val data = startup.readBytes()
            for (i in 0 until data.size) mem[i + pc] = data[i].toInt() and 0xFF
        } else {
            val data = File(file).readBytes()
            for (i in 0 until data.size) mem[i + pc] = data[i].toInt() and 0xFF
        }
    }

    /**
     * resets chip-8 state
     */
    private fun reset() {
        for (i in 0 until mem.size) mem[i] = 0
        for (reg in 0 until v.size) v[reg] = 0
        for (s in 0 until stack.size) stack[s] = 0
        for (k in 0 until key.size) key[k] = 0
        i = 0
        sp = 0
        pc = 0x200
        delay = 0
        sound = 0
        loadFont()
    }

    /**
     * loads chip-8 font into memory
     */
    private fun loadFont() {

        // font configuration
        val font = intArrayOf(
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
        )

        // loads font into memory
        for (i in 0x000 until 0x050) mem[i] = font[i]
    }

    /**
     * decodes chip-8 operation codes
     */
    private fun decode() {

        // decodes commands by most significant 4 bits
        // program counter incremented by 2 after most commands
        when (opcode and 0xF000) {

            // multifunctional opcode
            0x0000 -> {

                // lower 8 bits
                val lo = opcode and 0x00FF
                when (lo) {

                    // clears display
                    0xE0 -> Display.clear()

                    // returns from subroutine
                    0xEE -> {
                        pc = stack[sp]
                        sp--
                    }
                }
                pc = (pc + 2) and 0xFFF
            }

            // sets program counter to lower 12 bits
            0x1000 -> pc = opcode and 0x0FFF

            // jumps to subroutine at location
            // represented by lower 12 bits
            0x2000 -> {
                sp++
                stack[sp] = pc
                pc = opcode and 0x0FFF
            }

            // jumps past next instruction
            // if value specified register
            // is equal to value n
            0x3000 -> {
                val reg = (opcode shr 8) and 0x000F
                val n = opcode and 0x00FF
                if (v[reg] == n) pc = (pc + 2) and 0xFFF
                pc = (pc + 2) and 0xFFF
            }

            // jumps past next instruction
            // if value in specified register
            // is not equal to value n
            0x4000 -> {
                val reg = (opcode shr 8) and 0x000F
                val n = opcode and 0x00FF
                if (v[reg] != n) pc = (pc + 2) and 0xFFF
                pc = (pc + 2) and 0xFFF
            }

            // jumps past next instruction
            // if value in register x is equal to
            // vale in register y
            0x5000 -> {
                val reg1 = (opcode shr 8) and 0x000F
                val reg2 = (opcode shr 4) and 0x000F
                if (v[reg1] == v[reg2]) pc = (pc + 2) and 0xFFF
                pc = (pc + 2) and 0xFFF
            }

            // sets value in specified register to
            // lower 8 bits of opcode
            0x6000 -> {
                val reg = (opcode shr 8) and 0x000F
                v[reg] = opcode and 0x00FF
                pc = (pc + 2) and 0xFFF
            }

            // adds value of lower 8 bits of opcode
            // to value in specified register
            0x7000 -> {
                val reg = (opcode shr 8) and 0x000F
                v[reg] += opcode and 0x00FF
                if (v[reg] > 0xFF) v[reg] -= 0x100
                pc = (pc + 2) and 0xFFF
            }

            // multifunctional opcode
            0x8000 -> {
                val op = opcode and 0x000F
                val reg1 = (opcode shr 8) and 0x000F
                val reg2 = (opcode shr 4) and 0x000F
                when(op) {
                    0x0 -> v[reg1] = v[reg2] // value of reg1 equal to value of reg2
                    0x1 -> v[reg1] = v[reg1] or v[reg2] // value of reg1 or value of reg2
                    0x2 -> v[reg1] = v[reg1] and v[reg2] // value of reg1 and value of reg2
                    0x3 -> v[reg1] = v[reg1] xor v[reg2] // value of reg1 xor value of reg2

                    // adds value of register 2 to
                    // value of register 1
                    // flag register is set if overflow occurs
                    0x4 -> {
                        v[reg1] += v[reg2]
                        if (v[reg1] > 0xFF) {
                            v[0xF] = 1
                            v[reg1] -= 0x100
                        }
                        else v[0xF] = 0
                    }

                    // subtracts value of register 2
                    // from value of register 1
                    // flag register is set if borrowing is needed
                    0x5 -> {
                        v[reg1] -= v[reg2]
                        if (v[reg1] < 0) {
                            v[0xF] = 0
                            v[reg1] += 0x100
                        }
                        else v[0xF] = 1
                    }

                    // sets value of flag register 'f' to
                    // least significant bit and shifts
                    // value of register by one bit to the right
                    0x6 -> {
                        v[0xF] = v[reg1] and 0x1
                        v[reg1] = v[reg1] shr 1
                    }

                    // subtract value of register 1 from
                    // value of register 2 and stores
                    // result in register 1
                    // flag register is set if borrowing is needed
                    0x7 -> {
                        v[reg1] = v[reg2] - v[reg1]
                        if (v[reg1] < 0) {
                            v[0xF] = 0
                            v[reg1] += 0x100
                        }
                        else {
                            v[0xF] = 1
                        }
                    }

                    // sets value of flag register 'f' to
                    // most significant bit and shifts
                    // value of register by one bit to the left
                    0xE -> {
                        v[0xF] = (v[reg1] shr 7) and 1
                        v[reg1] = v[reg1] shl 1
                    }
                }
                pc = (pc + 2) and 0xFFF
            }

            // skips next instruction if value in register 1
            // is not equal to value in register 2
            0x9000 -> {
                val reg1 = (opcode shr 8) and 0x000F
                val reg2 = (opcode shr 4) and 0x000F
                if (v[reg1] != v[reg2]) pc = (pc + 2) and 0xFFF
                pc = (pc + 2) and 0xFFF
            }

            // sets i register to value of lower
            // 12 bits of opcode
            0xA000 -> {
                i = opcode and 0x0FFF
                pc = (pc + 2) and 0xFFF
            }

            // sets program counter to value in
            // register 0 plus value of lower
            // 12 bits of opcode
            0xB000 -> pc = v[0] + (opcode and 0x0FFF)

            // puts random value into specified register
            0xC000 -> {
                val reg = (opcode shr 8) and 0x000F
                val rand = Random()
                v[reg] = (rand.nextInt(0x100)) and (opcode and 0xFF)
                pc = (pc + 2) and 0xFFF
            }

            // draws sprite on display
            0xD000 -> {
                val reg1 = (opcode shr 8) and 0x000F
                val reg2 = (opcode shr 4) and 0x000F
                val x = v[reg1] // x coordinate
                val y = v[reg2] // y coordinate
                val n = opcode and 0x000F // number of rows of 8 pixels
                v[0xF] = 0

                // sets pixels on display
                for ((memOffset, r) in (y until y + n).withIndex()) {
                    var bitOffset = 7
                    for (c in x until x + 8) {
                        // flag register set if collision occurs (set pixel becomes unset)
                        v[0xF] = v[0xF] or Display.set(r, c, (mem[i + memOffset] ushr bitOffset) and 0x0001)
                        bitOffset--
                    }
                }
                pc = (pc + 2) and 0xFFF
            }

            // keyboard function opcode
            0xE000 -> {
                val op = opcode and 0x00FF
                val reg = (opcode shr 8) and 0x000F

                when (op) {
                    0x9E -> if (key[v[reg]] == 1) pc = (pc + 2) and 0xFFF // skips next instruction if specified key is pressed
                    0xA1 -> if (key[v[reg]] == 0) pc = (pc + 2) and 0xFFF // skips next instruction if specified key is not pressed
                }
                pc = (pc + 2) and 0xFFF
            }

            // multifunctional opcode
            0xF000 -> {
                val op = opcode and 0x00FF
                val reg = (opcode shr 8) and 0x000F
                when(op) {

                    // sets value of register to delay timer value
                    0x07 -> v[reg] = delay

                    // pauses program until key is pressed
                    // and stores value of key into specified register
                    0x0A -> {
                        Emulator.waitForInput = true
                        while (keyPressed < 0 && !Emulator.stop) {
                            Thread.sleep(1)
                        }
                        Emulator.waitForInput = false
                        v[reg] = keyPressed
                        keyPressed = -1
                    }

                    // sets delay value equal to register value
                    0x15 -> delay = v[reg]

                    // sets sound value equal to register value
                    0x18 -> sound = v[reg]

                    // adds value of register to i register
                    0x1E -> i += v[reg]

                    // sets i equal to location of specified font character
                    0x29 -> {
                        val font = v[reg]
                        when (font) {
                            0x0 -> i = 0x00 // location of 0 character
                            0x1 -> i = 0x05 // location of 1 character
                            0x2 -> i = 0x0A // location of 2 character
                            0x3 -> i = 0x0F // location of 3 character
                            0x4 -> i = 0x14 // location of 4 character
                            0x5 -> i = 0x19 // location of 5 character
                            0x6 -> i = 0x1E // location of 6 character
                            0x7 -> i = 0x23 // location of 7 character
                            0x8 -> i = 0x28 // location of 8 character
                            0x9 -> i = 0x2D // location of 9 character
                            0xA -> i = 0x32 // location of a character
                            0xB -> i = 0x37 // location of b character
                            0xC -> i = 0x3C // location of c character
                            0xD -> i = 0x41 // location of d character
                            0xE -> i = 0x46 // location of e character
                            0xF -> i = 0x4B // location of f character
                        }
                    }

                    // gets value of specified register
                    // and stores its decimal number representation
                    // into memory starting at location specified by
                    // i register
                    0x33 -> {
                        var regVal = v[reg]
                        val bcd1 = regVal % 10
                        regVal /= 10
                        val bcd2 = regVal % 10
                        val bcd3 = regVal / 10

                        mem[i] = bcd3
                        mem[i+1] = bcd2
                        mem[i+2] = bcd1
                    }

                    // saves all register values in memory starting at
                    // location specified by i register
                    0x55 -> for (r in 0..reg) mem[i + r] = v[r]

                    // loads all register values from memory starting at
                    // location specified by i register
                    0x65 -> for (r in 0..reg) v[r] = mem[i + r]
                }
                pc = (pc + 2) and 0xFFF
            }
        }
    }

    // decrements sound and delay timers at 60Hz rate
    // sound is currently not implemented
    inner class DecrementTimers: TimerTask() {

        /**
         * decrements delay and sound timers
         */
        override fun run() {
            if (delay > 0) delay--
            if (sound > 0) sound--
        }
    }
}