import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Feature } from '../model/feature';
import { Instance } from '../model/instance';

@Component({
  selector: 'app-canvas-building-block',
  templateUrl: './canvas-building-block.component.html',
  styleUrls: ['./canvas-building-block.component.css']
})
/**
 * Internal class to display single business model decisions of the business model canvas.
 *
 * @author Author removed due to blind review
 */
export class CanvasBuildingBlockComponent {

  @Input() feature: Feature;
  @Input() levelDepth: number;
  @Input() instance: Instance;
  @Input() doubleBlock: boolean;
  @Input() conformance: {
    errorFeatureIds: string[],
    warningFeatureIds: string[],
    strengthFeatureIds: string[],
    hintFeatureIds: string[]
  };
  @Input() showWarnings: boolean;
  @Input() showStrengths: boolean;
  @Input() showHints: boolean;
  @Input() compareInstance: Instance = null;
  @Input() percentages: { [id: string]: number } = null;

  @Output() addFeatureEmitter = new EventEmitter<string>();
  @Output() deleteFeatureEmitter = new EventEmitter<string>();

  /**
   * Create a new instance of the CanvasBuildingBlockComponent.
   */
  constructor() {
  }

  /**
   * Emit Event to add feature.
   * @param featureId current feature
   */
  addFeature(featureId: string) {
    this.addFeatureEmitter.emit(featureId);
  }

  /**
   * Emit Event to delete feature.
   * @param featureId current feature
   */
  deleteFeature(featureId: string) {
    this.deleteFeatureEmitter.emit(featureId);
  }

  /**
   * Forward event emitter to add feature.
   * @param featureId current feature
   */
  addFeatureForwardEmitter(featureId: string) {
    this.addFeature(featureId);
  }

  /**
   * Forward event emitter to delete feature.
   * @param featureId featureId
   */
  deleteFeatureForwardEmitter(featureId: string) {
    this.deleteFeature(featureId);
  }

  asList(map: { [id: string]: Feature }): Feature[] {
    return Object.values(map);
  }

}
