import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmiPage } from './ami.page';

describe('AmiPage', () => {
  let component: AmiPage;
  let fixture: ComponentFixture<AmiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AmiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
