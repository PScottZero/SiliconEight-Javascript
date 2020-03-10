/**
 * @author Paul J. Scott
 * @version 20 October 2018
 *
 * This class handles the visual output of the emulator.
 * The class mimics a 64x32 monochrome monitor.
 */

import java.awt.Color
import java.awt.Dimension
import java.awt.Graphics
import javax.swing.JPanel

// display class
class Display: JPanel() {

    // background and foreground color
    private var bg = Color.BLACK
    private var fg = Color.WHITE

    // static objects
    companion object {

        // constants
        private const val screen_width = 640
        private const val screen_height = 320
        private const val width = 64
        private const val height = 32
        private const val pixelSize = screen_width / width

        // virtual display memory
        val display = Array(height) { IntArray(width) }

        /**
         * sets value of pixel
         * @param r pixel row
         * @param c pixel column
         * @param value value of pixel, 0 is off, 1 is on
         */
        fun set(r: Int, c: Int, value: Int): Int {
            var row = r
            var col = c
            var flag = 0
            if (row >= height || row < 0) row %= height
            if (col >= width || col < 0) col %= width
            display[row][col] = display[row][col] xor value
            if (display[row][col] != value && value == 1) flag = 1
            return flag
        }

        /**
         * sets all pixel values equal to 0
         */
        fun clear() {
            for (r in 0 until display.size)
                for (c in 0 until display[r].size)
                    display[r][c] = 0
        }
    }

    // initializes display
    init {
        size = Dimension(screen_width, screen_height)
        background = Color.BLACK
    }

    /**
     * sets background color
     * @param c color of background
     */
    fun setBG(c: Color) { bg = c }

    /**
     * returns background color
     */
    fun getBG(): Color { return bg }

    /**
     * sets foreground color
     * @param c color of foreground
     */
    fun setFG(c: Color) { fg = c }

    /**
     * returns foreground color
     */
    fun getFG(): Color { return fg }

    /**
     * draws display pixels
     * @param g java graphics
     */
    public override fun paintComponent(g: Graphics) {
        super.paintComponent(g)
        g.color = bg
        g.fillRect(0, 0, screen_width, screen_height)
        g.color = fg
        for (r in 0 until display.size) {
            for (c in 0 until display[r].size) {
                if (display[r][c] == 1) g.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize)
            }
        }
    }
}