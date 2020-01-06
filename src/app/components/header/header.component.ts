import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  showDropDown = false;

  // toggle drop down (only for mobile)
  toggleMenu() {
    this.showDropDown = !this.showDropDown;
  }
}
