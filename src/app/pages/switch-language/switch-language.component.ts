import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
})
export class SwitchLanguageComponent {
  isEnglish = false; // ban đầu là false, nghĩa là tiếng Việt

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');
  }

  switchLang(isEnglish: boolean) {
    this.isEnglish = isEnglish;
    const lang = isEnglish ? 'en' : 'vi';
    // console.log('Switching language to:', lang);
    this.translate.use(lang);
  }
}
