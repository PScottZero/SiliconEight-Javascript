# SiliconEight

This program emulates the Chip-8 system. If you are unfamiliar with what the Chip-8 was, I would strongly recommend looking at this link: https://en.wikipedia.org/wiki/CHIP-8. Currently, this emulator works with almost all existing Chip-8 demos and games. The only thing not currently implemented in this emulator is sound. This will be tackled at a later date.

# Features

While this is just a basic Chip-8 emulator at heart, it does have some extra features that make it more enjoyable. First, the background and foreground color of the display field can be changed to any desired colors. Also, the emulator can be run at three different speeds in order to suit different games and demos. The emulator can be paused and reset at any time as well.

# How To Use

To load a program, simply go to File->Load in the menubar. You will then be prompted to load a program with the file extension .ch8. If you downloaded the program from the releases tab on GitHub, then all of the programs should be located in the roms folder, which should show up in the file explorer by default. Once a program is loaded, it will automatically start to run. Most programs will require keyboard input to operate. The original Chip-8 had a 16-key keyboard with the following layout and have been mapped to the corresponding keyboard keys:

```
[ 1 ][ 2 ][ 3 ][ C ] -> [ 1 ][ 2 ][ 3 ][ 4 ]
[ 4 ][ 5 ][ 6 ][ D ] -> [ Q ][ W ][ E ][ R ]
[ 7 ][ 8 ][ 9 ][ E ] -> [ A ][ S ][ D ][ F ]
[ A ][ 0 ][ B ][ F ] -> [ Z ][ X ][ C ][ V ]
```

Note that not every program/game will use the same controls. At some point, I will probably list the controls for all programs included with this emulator.

The file menu of the emulator has several different functions. The loading function has already been covered, but there are still other options on this menu. If you want to pause the program at any point, simply go to File->Pause or press ctrl-P. To resume the program, just repeat the process. To reset the program, go to File->Reset or just press ctrl-R. To quit the emulator, just go to File-Quit or press ctrl-Q.

The edit menu allows you to customize the emulator. The background color can be changed by going to Edit->Background Color. A color chooser will then appear. Simple select what color you want to background to be and then press OK. This process is identical for foreground color by going to Edit->Foreground Color. Lastly, the emulator's speed can be changed by going to Edit->Emulation Speed. There are three different speed settings here, which are slow, normal, and fast. Some programs run better at certain speeds, so changing the emulation speed will benefit some programs.

# Resources I Used to Help Build This Emulator
- https://en.wikipedia.org/wiki/CHIP-8
- http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/
- http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
- https://github.com/dmatlack/chip8/tree/master/roms 
  - (where I got the programs for the emulator, all of which are public domain)

# Screenshots

![alt text](https://i.imgur.com/G744muS.png)<br><br>
![alt text](https://i.imgur.com/m2hXfXg.png)<br><br>
![alt text](https://i.imgur.com/0SXzGEj.png)<br><br>
![alt text](https://i.imgur.com/CJeoHwz.png)<br><br>
![alt text](https://i.imgur.com/qXqnhip.png)<br><br>
![alt text](https://i.imgur.com/B710DxF.png)<br><br>
![alt text](https://i.imgur.com/MppX3ZC.png)<br><br>
![alt text](https://i.imgur.com/ExrcIis.png)
