import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryingPage } from './trying-page';

describe('TryingPage', () => {
  let component: TryingPage;
  let fixture: ComponentFixture<TryingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryingPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TryingPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
