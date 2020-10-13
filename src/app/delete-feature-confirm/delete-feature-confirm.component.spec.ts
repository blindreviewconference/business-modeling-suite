import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFeatureConfirmComponent } from './delete-feature-confirm.component';

describe('DeleteFeatureConfirmComponent', () => {
  let component: DeleteFeatureConfirmComponent;
  let fixture: ComponentFixture<DeleteFeatureConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteFeatureConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteFeatureConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
