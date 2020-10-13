import { ModelInfoBoxComponent } from './model-info-box.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FeatureModel } from '../model/feature-model';

describe('ModelInfoBoxComponent', () => {
  let spectator: Spectator<ModelInfoBoxComponent>;
  const createComponent = createComponentFactory({
    component: ModelInfoBoxComponent,
  });

  beforeEach(() => spectator = createComponent({
    props: {
      featureModel: new FeatureModel({})
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
