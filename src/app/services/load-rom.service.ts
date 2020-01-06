import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadRomService {

  onloadFunction;
  xhr: XMLHttpRequest;
  rom: string;

  loadRom(rom: string) {
    this.rom = rom;
    if (this.onloadFunction !== undefined) {
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', 'assets/roms/' + rom + '.ch8', true);
      this.xhr.responseType = 'arraybuffer';
      this.xhr.onload = this.onloadFunction;
      this.xhr.send();
    }
  }
}
