import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeTreeComponent } from './merge-tree.component';

describe('MergeTreeComponent', () => {
  let component: MergeTreeComponent;
  let fixture: ComponentFixture<MergeTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergeTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
