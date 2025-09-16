import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartagePage } from './partage.page';

describe('PartagePage', () => {
  let component: PartagePage;
  let fixture: ComponentFixture<PartagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
