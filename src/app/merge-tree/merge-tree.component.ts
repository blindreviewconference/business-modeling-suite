import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Feature } from '../model/feature';
import { Trace } from '../model/trace';

@Component({
  selector: 'app-merge-tree',
  templateUrl: './merge-tree.component.html',
  styleUrls: ['./merge-tree.component.css']
})
export class MergeTreeComponent implements OnInit {

  @Input() features: { [id: string]: Feature };
  @Input() trace: Trace;

  @Output() addTrace = new EventEmitter<string>();
  @Output() selectFeature = new EventEmitter<string>();
  @Output() openDependencies = new EventEmitter<string>();
  @Output() openTrace = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }

  asList(map: { [id: string]: Feature }): Feature[] {
    return Object.values(map);
  }

}
