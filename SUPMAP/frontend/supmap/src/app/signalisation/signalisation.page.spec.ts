import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalisationPage } from './signalisation.page';

describe('SignalisationPage', () => {
  let component: SignalisationPage;
  let fixture: ComponentFixture<SignalisationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalisationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
