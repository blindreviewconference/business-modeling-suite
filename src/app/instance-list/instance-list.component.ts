import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Instance } from '../model/instance';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-instance-list',
  templateUrl: './instance-list.component.html',
  styleUrls: ['./instance-list.component.css']
})
export class InstanceListComponent implements OnInit {

  @Input() formTitle: string;
  @Input() listTitle: string;
  @Input() instances: Instance[];

  @Output() addInstance = new EventEmitter<FormGroup>();
  @Output() viewInstance = new EventEmitter<number>();
  @Output() deleteInstance = new EventEmitter<number>();

  instanceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.loadForm();
  }

  addInstanceForwardEmitter() {
    this.addInstance.emit(this.instanceForm);
    this.loadForm();
  }

  private loadForm() {
    this.instanceForm = this.fb.group({name: ['', Validators.required]});
  }

}
