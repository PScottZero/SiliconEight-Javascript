import {Component} from '@angular/core';
import {LoadRomService} from '../../services/load-rom.service';

@Component({
  selector: 'app-rom-list',
  templateUrl: './rom-list.component.html',
  styleUrls: ['./rom-list.component.scss']
})
export class RomListComponent {

  romList = [
    'Addition Problems',
    'Airplane',
    'Astro Dodge',
    'Blinky',
    'Bowling',
    'Breakout',
    'Cave',
    'Connect 4',
    'Filter',
    'Fishie',
    'Hello',
    'Hidden',
    'IBM Logo',
    'Landing',
    'Lunar Lander',
    'Maze',
    'Minimal Game',
    'Missile',
    'Pong (1 Player)',
    'Pong (2 Players)',
    'Rocket Launch',
    'Russian Roulette',
    'Sierpinski',
    'Space Invaders',
    'Spooky Spot',
    'Stars',
    'Tetris',
    'Tic-Tac-Toe',
    'Trip8 Demo',
    'UFO',
    'Vertical Brix',
    'Wipe Off',
    'Worm V4',
    'X-Mirror',
  ];

  constructor(private loadRomService: LoadRomService) {}

  loadRom(rom: string) {
    this.loadRomService.loadRom(rom);
  }
}
