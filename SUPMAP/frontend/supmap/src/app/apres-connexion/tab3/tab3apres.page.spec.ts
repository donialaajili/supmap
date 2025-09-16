import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';



import { Tab3apresPage } from './tab3apres.page';

describe('Tab3Page', () => {
  let component: Tab3apresPage;
  let fixture: ComponentFixture<Tab3apresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tab3apresPage],

    }).compileComponents();

    fixture = TestBed.createComponent(Tab3apresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
