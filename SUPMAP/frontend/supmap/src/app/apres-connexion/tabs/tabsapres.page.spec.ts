import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsapresPage } from './tabsapres.page';

describe('TabsPage', () => {
  let component: TabsapresPage;
  let fixture: ComponentFixture<TabsapresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabsapresPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsapresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
