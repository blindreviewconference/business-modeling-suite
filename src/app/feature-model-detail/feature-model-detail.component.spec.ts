import { FeatureModelDetailComponent } from './feature-model-detail.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { FeatureTreeComponent } from '../feature-tree/feature-tree.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DeleteFeatureConfirmComponent } from '../delete-feature-confirm/delete-feature-confirm.component';
import { FeatureFormComponent } from '../feature-form/feature-form.component';
import { CrossTreeRelationshipFormComponent } from '../cross-tree-relationship-form/cross-tree-relationship-form.component';
import { CrossTreeRelationshipModalComponent } from '../cross-tree-relationship-modal/cross-tree-relationship-modal.component';
import { AuthorFormComponent } from '../author-form/author-form.component';

describe('FeatureModelDetailComponent', () => {
  let spectator: Spectator<FeatureModelDetailComponent>;
  const createComponent = createComponentFactory({
    component: FeatureModelDetailComponent,
    declarations: [
      MockComponent(AuthorFormComponent),
      MockComponent(CrossTreeRelationshipFormComponent),
      MockComponent(CrossTreeRelationshipModalComponent),
      MockComponent(DeleteFeatureConfirmComponent),
      MockComponent(FeatureFormComponent),
      MockComponent(FeatureTreeComponent)
    ],
    imports: [ReactiveFormsModule, RouterTestingModule],
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
