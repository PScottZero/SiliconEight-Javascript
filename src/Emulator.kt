/**
 * @author Paul J. Scott
 * @version 5 November 2018
 *
 * This class initializes the emulator's interface
 * and creates a thread that emulates the Chip-8 system
 * when the user loads a program.
 */

import java.awt.Color
import java.awt.Dimension
import java.awt.Font
import java.awt.Image
import java.awt.event.ActionEvent
import java.awt.event.ActionListener
import java.awt.event.KeyEvent
import java.awt.event.KeyListener
import java.util.*
import javax.imageio.ImageIO
import javax.swing.*
import javax.swing.filechooser.FileNameExtensionFilter
import kotlin.system.exitProcess

// interface for emulator
class Emulator: JFrame() {

    // listeners
    private val listen = MenuEvent()
    private val keyPressed = KeyPressed()

    // static object class
    companion object {

        // starts program
        @JvmStatic fun main(args: Array<String>) { Emulator() }

        // static variables
        val display = Display()
        var file = ""
        var stop = false
        var pause = false
        var waitForInput = false

        // runs emulator
        fun startEmulation() {
            val thread = Chip8()
            Display.clear()
            thread.start()
        }
    }

    // initializes user interface
    init {

        // initializes window
        defaultCloseOperation = JFrame.EXIT_ON_CLOSE
        contentPane.preferredSize = Dimension(640, 320)
        isResizable = false
        title = "SiliconEight"

        // application icons
        val icons = ArrayList<Image>()
        icons.add(ImageIO.read(javaClass.getResource("img/icon_16.png")))
        icons.add(ImageIO.read(javaClass.getResource("img/icon_32.png")))
        icons.add(ImageIO.read(javaClass.getResource("img/icon_64.png")))
        icons.add(ImageIO.read(javaClass.getResource("img/icon_128.png")))
        iconImages = icons

        // adds components to gui
        addKeyListener(keyPressed)
        add(display)
        addMenu()
        pack()
        isVisible = true

        // runs emulator
        startEmulation()
    }

    /**
     * adds menu bar to user interface
     */
    private fun addMenu() {

        // initializes menu bar
        val menuBar = JMenuBar()
        menuBar.background = Color.WHITE

        // sets menu bar font
        val font = Font("Monospaced", Font.BOLD, 14)
        UIManager.put("Menu.font", font)
        UIManager.put("MenuItem.font", font)
        UIManager.put("RadioButtonMenuItem.font", font)

        // file menu
        val file = JMenu("File")
        file.mnemonic = KeyEvent.VK_F
        menuBar.add(file)

        // load program
        val load = JMenuItem("Load")
        load.mnemonic = KeyEvent.VK_L
        load.accelerator = KeyStroke.getKeyStroke(KeyEvent.VK_L, ActionEvent.CTRL_MASK)
        load.addActionListener(listen)
        file.add(load)

        // pause program
        val halt = JMenuItem("Pause")
        halt.mnemonic = KeyEvent.VK_P
        halt.accelerator = KeyStroke.getKeyStroke(KeyEvent.VK_P, ActionEvent.CTRL_MASK)
        halt.font = font
        halt.addActionListener(listen)
        file.add(halt)

        // reset program
        val reset = JMenuItem("Reset")
        reset.mnemonic = KeyEvent.VK_R
        reset.accelerator = KeyStroke.getKeyStroke(KeyEvent.VK_R, ActionEvent.CTRL_MASK)
        reset.font = font
        reset.addActionListener(listen)
        file.add(reset)

        file.add(JSeparator())

        // quit application
        val quit = JMenuItem("Quit")
        quit.mnemonic = KeyEvent.VK_Q
        quit.accelerator = KeyStroke.getKeyStroke(KeyEvent.VK_Q, ActionEvent.CTRL_MASK)
        quit.addActionListener(listen)
        file.add(quit)

        // edit menu
        val edit = JMenu("Edit")
        edit.mnemonic = KeyEvent.VK_E
        menuBar.add(edit)

        // background color changer
        val colorBG = JMenuItem("Background Color")
        colorBG.mnemonic = KeyEvent.VK_B
        colorBG.addActionListener(listen)
        edit.add(colorBG)

        // foreground color changer
        val colorFG = JMenuItem("Foreground Color")
        colorFG.mnemonic = KeyEvent.VK_F
        colorFG.addActionListener(listen)
        edit.add(colorFG)

        edit.add(JSeparator())

        // speed radio button group
        val speeds = ButtonGroup()

        // slow speed
        val slow = JRadioButtonMenuItem("Slow")
        slow.mnemonic = KeyEvent.VK_S
        slow.addActionListener(listen)
        speeds.add(slow)

        // normal speed
        val normal = JRadioButtonMenuItem("Normal")
        normal.mnemonic = KeyEvent.VK_N
        normal.addActionListener(listen)
        normal.isSelected = true
        speeds.add(normal)

        // fast speed
        val fast = JRadioButtonMenuItem("Fast")
        fast.mnemonic = KeyEvent.VK_F
        fast.addActionListener(listen)
        speeds.add(fast)

        // speed settings
        val speed = JMenu("Emulation Speed")
        speed.mnemonic = KeyEvent.VK_E
        speed.addActionListener(listen)
        speed.add(slow)
        speed.add(normal)
        speed.add(fast)
        edit.add(speed)

        // adds menu bar to interface
        jMenuBar = menuBar
    }

    // interface menu listener
    private inner class MenuEvent: ActionListener {

        /**
         * performs actions in file and edit menu
         * @param e action event (menu button press)
         */
        override fun actionPerformed(e: ActionEvent?) {
            when (e!!.actionCommand)
            {
                // load chip-8 programs
                "Load" -> {
                    val usrDir = System.getProperty("user.dir")
                    val filter = FileNameExtensionFilter("CHIP-8 Files", "ch8")
                    val chooser = JFileChooser(usrDir)
                    chooser.fileFilter = filter
                    val i = chooser.showOpenDialog(null)
                    if (i == JFileChooser.APPROVE_OPTION) {
                        stop = true
                        Thread.sleep(10)
                        file = chooser.selectedFile.toString()
                        stop = false
                        pause = false
                        startEmulation()
                    }
                }

                // pause program
                "Pause" -> pause = !pause

                // reset current program
                "Reset" -> {
                    stop = true
                    Thread.sleep(10)
                    stop = false
                    pause = false
                    startEmulation()
                }

                // quit application
                "Quit" -> exitProcess(0)

                // change background color
                "Background Color" -> {
                    val color = JColorChooser.showDialog(null, "Background Color", display.getBG())
                    display.setBG(color)
                    display.repaint()
                }

                // change foreground color
                "Foreground Color" -> {
                    val color = JColorChooser.showDialog(null, "Foreground Color", display.getFG())
                    display.setFG(color)
                    display.repaint()
                }

                // set speed to slow
                "Slow" -> { Chip8.setClockSpeed(5.0) }

                // set speed to normal
                "Normal" -> { Chip8.setClockSpeed(2.0) }

                // set speed to fast
                "Fast" -> { Chip8.setClockSpeed(0.01) }
            }
        }
    }

    // key listener class
    private inner class KeyPressed: KeyListener {

        /**
         * sends keyboard input to chip-8 when key is pressed
         * @param e keyboard event
         */
        override fun keyPressed(e: KeyEvent?) {
            when (e!!.keyCode){

                // keypad 1
                KeyEvent.VK_1 -> {
                    if (waitForInput) Chip8.setKeyPressed(0x1)
                    Chip8.setKey(0x1, 1)
                }

                // keypad 2
                KeyEvent.VK_2 -> {
                    if (waitForInput) Chip8.setKeyPressed(0x2)
                    Chip8.setKey(0x2, 1)
                }

                // keypad 3
                KeyEvent.VK_3 -> {
                    if (waitForInput) Chip8.setKeyPressed(0x3)
                    Chip8.setKey(0x3, 1)
                }

                // keypad c
                KeyEvent.VK_4 -> {
                    if (waitForInput) Chip8.setKeyPressed(0xC)
                    Chip8.setKey(0xC, 1)
                }

                // keypad 4
                KeyEvent.VK_Q -> {
                    if (waitForInput) Chip8.setKeyPressed(0x4)
                    Chip8.setKey(0x4, 1)
                }

                // keypad 5
                KeyEvent.VK_W -> {
                    if (waitForInput) Chip8.setKeyPressed(0x5)
                    Chip8.setKey(0x5, 1)
                }

                // keypad 6
                KeyEvent.VK_E -> {
                    if (waitForInput) Chip8.setKeyPressed(0x6)
                    Chip8.setKey(0x6, 1)
                }

                // keypad d
                KeyEvent.VK_R -> {
                    if (waitForInput) Chip8.setKeyPressed(0xD)
                    Chip8.setKey(0xD, 1)
                }

                // keypad 7
                KeyEvent.VK_A -> {
                    if (waitForInput) Chip8.setKeyPressed(0x7)
                    Chip8.setKey(0x7, 1)
                }

                // keypad 8
                KeyEvent.VK_S -> {
                    if (waitForInput) Chip8.setKeyPressed(0x8)
                    Chip8.setKey(0x8, 1)
                }

                // keypad 9
                KeyEvent.VK_D -> {
                    if (waitForInput) Chip8.setKeyPressed(0x9)
                    Chip8.setKey(0x9, 1)
                }

                // keypad e
                KeyEvent.VK_F -> {
                    if (waitForInput) Chip8.setKeyPressed(0xE)
                    Chip8.setKey(0xE, 1)
                }

                // keypad a
                KeyEvent.VK_Z -> {
                    if (waitForInput) Chip8.setKeyPressed(0xA)
                    Chip8.setKey(0xA, 1)
                }

                // keypad 0
                KeyEvent.VK_X -> {
                    if (waitForInput) Chip8.setKeyPressed(0x0)
                    Chip8.setKey(0x0, 1)
                }

                // keypad b
                KeyEvent.VK_C -> {
                    if (waitForInput) Chip8.setKeyPressed(0xB)
                    Chip8.setKey(0xB, 1)
                }

                // keypad f
                KeyEvent.VK_V -> {
                    if (waitForInput) Chip8.setKeyPressed(0xF)
                    Chip8.setKey(0xF, 1)
                }
            }
        }

        /**
         * sends keyboard input to chip-8 when key is released
         * @param e keyboard event
         */
        override fun keyReleased(e: KeyEvent?) {
            when (e!!.keyCode){
                KeyEvent.VK_1 -> Chip8.setKey(0x1, 0) // keypad 1
                KeyEvent.VK_2 -> Chip8.setKey(0x2, 0) // keypad 2
                KeyEvent.VK_3 -> Chip8.setKey(0x3, 0) // keypad 3
                KeyEvent.VK_4 -> Chip8.setKey(0xC, 0) // keypad c
                KeyEvent.VK_Q -> Chip8.setKey(0x4, 0) // keypad 4
                KeyEvent.VK_W -> Chip8.setKey(0x5, 0) // keypad 5
                KeyEvent.VK_E -> Chip8.setKey(0x6, 0) // keypad 6
                KeyEvent.VK_R -> Chip8.setKey(0xD, 0) // keypad d
                KeyEvent.VK_A -> Chip8.setKey(0x7, 0) // keypad 7
                KeyEvent.VK_S -> Chip8.setKey(0x8, 0) // keypad 8
                KeyEvent.VK_D -> Chip8.setKey(0x9, 0) // keypad 9
                KeyEvent.VK_F -> Chip8.setKey(0xE, 0) // keypad e
                KeyEvent.VK_Z -> Chip8.setKey(0xA, 0) // keypad a
                KeyEvent.VK_X -> Chip8.setKey(0x0, 0) // keypad 0
                KeyEvent.VK_C -> Chip8.setKey(0xB, 0) // keypad b
                KeyEvent.VK_V -> Chip8.setKey(0xF, 0) // keypad f
            }
        }

        /**
         * this function is not used in the program
         * @param e keyboard event
         */
        override fun keyTyped(e: KeyEvent?) {}
    }
}
