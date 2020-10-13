import { Component, Input } from '@angular/core';
import { Feature } from '../model/feature';

@Component({
  selector: 'app-feature-building-block',
  templateUrl: './feature-building-block.component.html',
  styleUrls: ['./feature-building-block.component.css']
})
/**
 * Internal class to display single features of the feature canvas.
 *
 * @author: Author removed due to blind review
 */
export class FeatureBuildingBlockComponent {
  @Input() buildingBlockName: any;
  @Input() features: Feature[];
  @Input() doubleBlock: boolean;
}
