import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalPage } from './signal.page';

describe('SignalPage', () => {
  let component: SignalPage;
  let fixture: ComponentFixture<SignalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
