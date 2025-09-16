import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestprofilPage } from './testprofil.page';

describe('TestprofilPage', () => {
  let component: TestprofilPage;
  let fixture: ComponentFixture<TestprofilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestprofilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
