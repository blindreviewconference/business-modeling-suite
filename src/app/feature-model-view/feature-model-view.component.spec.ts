import { FeatureModelViewComponent } from './feature-model-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { createRoutingFactory, Spectator } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { FeatureBuildingBlockComponent } from '../feature-building-block/feature-building-block.component';
import { InstanceListComponent } from '../instance-list/instance-list.component';
import { ModelInfoBoxComponent } from '../model-info-box/model-info-box.component';

describe('FeatureModelViewComponent', () => {
  let spectator: Spectator<FeatureModelViewComponent>;
  const createComponent = createRoutingFactory({
    component: FeatureModelViewComponent,
    declarations: [
      MockComponent(FeatureBuildingBlockComponent),
      MockComponent(InstanceListComponent),
      MockComponent(ModelInfoBoxComponent),
    ],
    imports: [ReactiveFormsModule],
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
