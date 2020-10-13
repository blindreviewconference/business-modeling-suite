import { FeatureModelComponent } from './feature-model.component';
import { createRoutingFactory, Spectator } from '@ngneat/spectator';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { ModelListComponent } from '../model-list/model-list.component';

describe('FeatureModelComponent', () => {
  let spectator: Spectator<FeatureModelComponent>;
  const createComponent = createRoutingFactory({
    component: FeatureModelComponent,
    declarations: [
      MockComponent(ModelListComponent),
    ],
    imports: [ReactiveFormsModule],
  });

  beforeEach(() => spectator = createComponent());
});
