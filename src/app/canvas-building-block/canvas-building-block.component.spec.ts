import { CanvasBuildingBlockComponent } from './canvas-building-block.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Feature } from '../model/feature';
import { Instance } from '../model/instance';

describe('CanvasBuildingBlockComponent', () => {
  let spectator: Spectator<CanvasBuildingBlockComponent>;
  const createComponent = createComponentFactory(CanvasBuildingBlockComponent);

  const feature = new Feature('value-propositions', null, {name: 'Value Propositions'});
  const instance = new Instance(0, {});

  beforeEach(() => spectator = createComponent({
    props: {
      feature,
      instance,
      conformance: {errorFeatureIds: [], warningFeatureIds: [], strengthFeatureIds: [], hintFeatureIds: []}
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
