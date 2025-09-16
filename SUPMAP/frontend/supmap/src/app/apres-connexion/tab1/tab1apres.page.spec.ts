import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';



import { Tab1apresPage } from './tab1apres.page';

describe('Tab1Page', () => {
  let component: Tab1apresPage;
  let fixture: ComponentFixture<Tab1apresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tab1apresPage],

    }).compileComponents();

    fixture = TestBed.createComponent(Tab1apresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
