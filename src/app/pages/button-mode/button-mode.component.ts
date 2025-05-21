import { Component } from '@angular/core';

@Component({
  selector: 'app-button-mode',
  templateUrl: './button-mode.component.html',
  styleUrls: ['./button-mode.component.sass'],
})
export class ButtonModeComponent {
  switchValue = false;
  switchMode(mode: boolean): void {
    const body = document.body;
    if (mode) {
      body.classList.add('dark-theme'); // Bật dark mode
    } else {
      body.classList.remove('dark-theme'); // Bật light mode
    }
  }
}
