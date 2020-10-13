import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossTreeRelationshipFormComponent } from './cross-tree-relationship-form.component';

describe('CrossTreeRelationshipFormComponent', () => {
  let component: CrossTreeRelationshipFormComponent;
  let fixture: ComponentFixture<CrossTreeRelationshipFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrossTreeRelationshipFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrossTreeRelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
