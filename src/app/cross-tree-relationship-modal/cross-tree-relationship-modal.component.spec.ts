import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossTreeRelationshipModalComponent } from './cross-tree-relationship-modal.component';

describe('CrossTreeRelationshipModalComponent', () => {
  let component: CrossTreeRelationshipModalComponent;
  let fixture: ComponentFixture<CrossTreeRelationshipModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossTreeRelationshipModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossTreeRelationshipModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
