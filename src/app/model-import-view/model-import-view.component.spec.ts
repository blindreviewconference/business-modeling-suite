import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelImportViewComponent } from './model-import-view.component';

describe('ModelImportViewComponent', () => {
  let component: ModelImportViewComponent;
  let fixture: ComponentFixture<ModelImportViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelImportViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelImportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
