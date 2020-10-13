import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraceModalComponent } from './trace-modal.component';

describe('TraceModalComponent', () => {
  let component: TraceModalComponent;
  let fixture: ComponentFixture<TraceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
