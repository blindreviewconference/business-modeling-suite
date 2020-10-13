import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../pouchdb.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FeatureModel } from '../model/feature-model';
import { ImportExportService } from '../import-export.service';
import { Feature } from '../model/feature';
import { Instance, InstanceType } from '../model/instance';

@Component({
  selector: 'app-feature-model-view',
  templateUrl: './feature-model-view.component.html',
  styleUrls: ['./feature-model-view.component.css']
})
/**
 * The FeatureModelViewComponent shows the feature model mapped to the building blocks of the canvas.
 *
 * @author: Author removed due to blind review
 */
export class FeatureModelViewComponent implements OnInit, OnDestroy {

  featureModelId: string;
  featureModel: FeatureModel;
  selectedExpertModelList: FeatureModel[];
  selectedExpertModelForm = this.fb.group({expertModelId: [null, Validators.required]});
  unselectedExpertModelList: FeatureModel[];

  private subscription: Subscription;

  /**
   * Create a new instance of the FeatureModelViewComponent.
   * @param importExportService ImportExportService
   * @param route ActivatedRoute
   * @param pouchDBServer PouchdbService
   * @param router Router
   * @param fb FormBuilder
   */
  constructor(
    private importExportService: ImportExportService,
    private route: ActivatedRoute,
    private pouchDBServer: PouchdbService,
    private router: Router,
    private fb: FormBuilder
  ) {
  }

  /**
   * Initialize the component.
   */
  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe(map => {
      this.featureModelId = map.get('id');
      this.loadFeatureModel(this.featureModelId);
    });
  }

  /**
   * Add a new instance.
   */
  addInstance(instanceForm: FormGroup, type = InstanceType.EXAMPLE) {
    this.pouchDBServer.addInstance(this.featureModelId, {name: instanceForm.value.name, type}).then(() => {
        this.loadFeatureModel(this.featureModelId);
      },
      error => {
        console.log('AddInstance: ' + error);
      });
  }

  /**
   * Navigate to a single business model.
   * @param businessModelId id of the business model
   */
  viewBusinessModel(businessModelId: number): void {
    this.router.navigate(['/businessmodelview', this.featureModelId, businessModelId]);
  }

  /**
   * Delete a business model by id.
   * @param businessModelId id of the business model
   */
  deleteBusinessModel(businessModelId: number): void {
    this.pouchDBServer.deleteBusinessModel(this.featureModelId, businessModelId).then(() => {
      this.loadFeatureModel(this.featureModelId);
    }, error => {
      console.log('DeleteBusinessModel: ' + error);
    });
  }

  /**
   * Select an expert model.
   */
  selectExpertModel() {
    this.pouchDBServer.selectExpertModel(this.featureModelId, this.selectedExpertModelForm.value.expertModelId).then(() => {
        this.selectedExpertModelForm.reset();
        this.loadExpertModels(this.featureModelId);
      },
      error => {
        console.log('SelectExpertModel: ' + error);
      });
  }

  /**
   * Navigate to a component to view the current expert model.
   *
   * @param expertModelId id of the current expert model
   */
  viewExpertModel(expertModelId: string): void {
    this.router.navigate(['/featuremodelview', expertModelId]);
  }

  mergeExpertModel(expertModelId: string): void {
    this.router.navigate(['/merge', this.featureModelId, expertModelId]);
  }

  /**
   * Unselect an expert model by id.
   *
   * @param expertModelId id of the expert model
   */
  unselectExpertModel(expertModelId: string): void {
    this.pouchDBServer.unselectExpertModel(this.featureModelId, expertModelId).then(() => {
      this.loadExpertModels(this.featureModelId);
    }, error => {
      console.log('UnselectExpertModel: ' + error);
    });
  }

  /**
   * Load the current feature model.
   * @param featureModelId id of the current feature model
   */
  private loadFeatureModel(featureModelId) {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(result => {
      this.featureModel = result;

      if (!this.featureModel.expertModel) {
        this.loadExpertModels(featureModelId);
      }
    }, error => {
      console.log('LoadFeatureModel: ' + error);
    });
  }

  /**
   * Load selected and unselected expert models
   *
   * @param companyModelId the id of the company model
   */
  private loadExpertModels(companyModelId: string) {
    this.loadSelectedExpertModels(companyModelId);
    this.loadUnselectedExpertModels(companyModelId);
  }

  /**
   * Load all selected expert models
   *
   * @param companyModelId the id of the company model
   */
  private loadSelectedExpertModels(companyModelId: string) {
    this.pouchDBServer.getSelectedExpertModels(companyModelId).then(result => {
      this.selectedExpertModelList = result.docs;
    }, error => {
      console.log('LoadSelectedExpertModels: ' + error);
    });
  }

  /**
   * Load all unselected expert models
   *
   * @param companyModelId the id of the company model
   */
  private loadUnselectedExpertModels(companyModelId: string): void {
    this.pouchDBServer.getUnselectedExpertModels(companyModelId).then(result => {
      this.unselectedExpertModelList = result.docs;
    }, error => {
      console.log('RefreshExpertModelList: ' + error);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  exportModel() {
    this.importExportService.exportModel(this.featureModelId);
  }

  getExampleInstances(): Instance[] {
    return this.featureModel.instances.filter((instance) => instance.type === InstanceType.EXAMPLE);
  }

  getPatternInstances(): Instance[] {
    return this.featureModel.instances.filter((instance) => instance.type === InstanceType.PATTERN);
  }

  getPatternInstanceType() {
    return InstanceType.PATTERN;
  }

  asList(features: { [id: string]: Feature }): Feature[] {
    return Object.values(features);
  }

}
