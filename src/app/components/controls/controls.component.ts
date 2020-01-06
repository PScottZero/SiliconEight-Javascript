import {Component} from '@angular/core';
import {LoadRomService} from '../../services/load-rom.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {

  constructor(private loadRomService: LoadRomService) {}

  getControls(): string[] {
    switch (this.loadRomService.rom) {
      case 'Addition Problems':
        return ['1 - 1', '2 - 2', '3 - 3', 'Q - 4', 'W - 5', 'E - 6', 'A - 7', 'S - 8', 'D - 9', 'X - 0'];
      case 'Airplane':
        return ['S - Drop'];
      case 'Astro Dodge':
        return ['Q - Left', 'E - Right', 'W - Start'];
      case 'Blinky':
        return ['3 - Up', 'E - Down', 'A - Left', 'S - Right', 'V - Restart'];
      case 'Bowling':
        return ['[1-4][Q-R][A-F][Z-V] - Throw', '1 - 1', '2 - 2', '3 - 3', 'Q - 4',
                'W - 5', 'E - 6', 'A - 7', 'S - 8', 'D - 9', 'X - 0'];
      case 'Breakout':
        return ['Q - Left', 'E - Right'];
      case 'Cave':
        return ['2 - Up', 'S - Down', 'Q - Left', 'E - Right', 'V - Start/Restart'];
      case 'Connect 4':
        return ['Q - Left', 'E - Right', 'W - Place Chip'];
      case 'Filter':
        return ['Q - Left', 'E - Right'];
      case 'Hidden':
        return ['2 - Up', 'S - Down', 'Q - Left', 'E - Right', 'W - Choose Card', '[1-4][Q-R][A-F][Z-V] - Start'];
      case 'Landing':
        return ['S - Shoot'];
      case 'Lunar Lander':
        return ['2 - Thrust', 'Q - Left', 'E - Right', '1, 2, 3 - Option'];
      case 'Minimal Game':
        return ['2 - Up', 'S - Down', 'Q - Left', 'E - Right'];
      case 'Missile':
        return ['S - Shoot'];
      case 'Pong (1 Player)':
        return ['1 - Up', 'Q - Down'];
      case 'Pong (2 Players)':
        return ['1 - P1 Up', 'Q - P1 Down', '4 - P2 Up', 'R - P2 Down'];
      case 'Rocket Launch':
        return ['Q - Left', 'E - Right', 'C - Start'];
      case 'Russian Roulette':
        return ['[1-4][Q-R][A-F][Z-V] - Shoot'];
      case 'Space Invaders':
        return ['Q - Left', 'E - Right', 'W - Shoot/Start'];
      case 'Spooky Spot':
        return ['[1-4][Q-R][A-F][Z-V] - Start'];
      case 'Tetris':
        return ['Q - Rotate', 'W - Left', 'E - Right', 'A - Down'];
      case 'Tic-Tac-Toe':
        return ['1 - Top Left', '2 - Top Middle', '3 - Top Left',
                'Q - Middle Left', 'W - Center', 'E - Middle Right',
                'A - Bottom Left', 'S - Bottom Middle', 'D - Bottom Right'];
      case 'UFO':
        return ['Q - Shoot Left', 'W - Shoot Straight', 'E - Shoot Right'];
      case 'Vertical Brix':
        return ['1 - Up', 'Q - Down', 'A - Start'];
      case 'Wipe Off':
        return ['Q - Left', 'E - Right', '[1-4][Q-R][A-F][Z-V] - Start'];
      case 'Worm V4':
        return ['2 - Up', 'S - Down', 'Q - Left', 'E - Right'];
      case 'X-Mirror':
        return ['2 - Up', 'S - Down', 'Q - Left', 'E - Right'];
    }
    return ['None'];
  }
}
