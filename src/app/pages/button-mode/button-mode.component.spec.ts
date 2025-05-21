import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModeComponent } from './button-mode.component';

describe('ButtonModeComponent', () => {
  let component: ButtonModeComponent;
  let fixture: ComponentFixture<ButtonModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonModeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
