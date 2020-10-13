import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeIntoTreeComponent } from './merge-into-tree.component';

describe('MergeIntoTreeComponent', () => {
  let component: MergeIntoTreeComponent;
  let fixture: ComponentFixture<MergeIntoTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeIntoTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeIntoTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
