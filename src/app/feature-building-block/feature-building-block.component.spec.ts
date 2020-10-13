import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { FeatureBuildingBlockComponent } from './feature-building-block.component';
import { Feature } from '../model/feature';

describe('FeatureBuildingBlockComponent', () => {
  let spectator: Spectator<FeatureBuildingBlockComponent>;
  const createComponent = createComponentFactory(FeatureBuildingBlockComponent);

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should display building block name', () => {
    spectator.setInput('buildingBlockName', 'Value Proposition');
    expect(spectator.query('li strong').textContent).toBe('Value Proposition');
  });

  it('should display features', () => {
    spectator.setInput('features', [new Feature('test-feature', null, {name: 'Test Feature'})]);
    const features = spectator.queryAll('li a');
    expect(features.length).toBe(1);
    expect(features[0].textContent).toBe(' Test Feature ');
  });

});
