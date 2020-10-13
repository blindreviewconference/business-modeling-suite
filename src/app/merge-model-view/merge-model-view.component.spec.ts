import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeModelViewComponent } from './merge-model-view.component';

describe('MergeModelViewComponent', () => {
  let component: MergeModelViewComponent;
  let fixture: ComponentFixture<MergeModelViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeModelViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeModelViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
