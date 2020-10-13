import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../pouchdb.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feature, FeatureType } from '../model/feature';
import { FeatureModel } from '../model/feature-model';
import { Subscription } from 'rxjs';
import { Instance } from '../model/instance';

@Component({
  selector: 'app-business-model-view',
  templateUrl: './business-model-view.component.html',
  styleUrls: ['./business-model-view.component.css']
})
/**
 * The BusinessModelViewComponent shows the business model and allow the adding/updating/deleting of
 * business decisions together with a conformance checking.
 *
 * @author: Author removed due to blind review
 */
export class BusinessModelViewComponent implements OnInit, OnDestroy {

  featureModelId: string;
  businessModelId: number;
  featureModel: FeatureModel;
  businessModelInstance: Instance;

  modalFeature: Feature;
  modalUnselectedFeatures: Feature[];
  modalReference: NgbModalRef;
  addFeatureForm: FormGroup;
  updateBusinessModelForm: FormGroup;

  // Conformance Checking
  conformanceIsChecked: boolean;
  conformance: {
    errorFeatureIds: string[],
    errors: string[],
    warningFeatureIds: string[],
    warnings: string[],
    strengthFeatureIds: string[],
    strengths: string[],
    hintFeatureIds: string[],
    hints: string[]
  };
  conformanceOptionsForm: FormGroup = this.fb.group({showWarnings: true, showStrengths: true, showHints: false});

  // Compare / Heatmap
  selectOtherInstanceForm: FormGroup = this.fb.group({instance: [null, Validators.required]});
  compareInstance: Instance = null;
  percentages: { [id: string]: number } = null;

  // Instances from expert models
  instances: { [expertModelId: string]: Instance[] };


  @ViewChild('addModal', {static: true}) addModal: any;
  @ViewChild('deleteModal', {static: true}) deleteModal: any;

  private routeSubscription: Subscription;

  /**
   * Create a new instance of the BusinessModelViewComponent.
   * @param route ActivatedRoute
   * @param router Router
   * @param pouchDBServer PouchdbService
   * @param modalService NgbModal
   * @param fb FormBuilder
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pouchDBServer: PouchdbService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
  }

  /**
   * Initialize the component.
   */
  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      this.addFeatureForm = this.fb.group({featurename: ['', Validators.required]});
      this.updateBusinessModelForm = this.fb.group({name: ['', Validators.required], description: ['']});
      this.featureModelId = paramMap.get('id');
      this.businessModelId = +paramMap.get('bmid');

      // Init conformance checking
      this.uncheckConformance();

      // Init the feature model
      this.loadFeatureModel();
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  /**
   * Load the feature model an clean other values
   */
  private loadFeatureModel() {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      this.featureModel = featureModel;
      this.businessModelInstance = this.featureModel.getInstance(this.businessModelId);
      this.updateBusinessModelForm.setValue({
        name: this.businessModelInstance.name,
        description: this.businessModelInstance.description ? this.businessModelInstance.description : ''
      });
      this.checkConvert().then(() => this.compareInstance ? this.compare() : null);
      if (this.conformanceIsChecked) {
        this.checkConformance();
      } else {
        this.uncheckConformance();
      }
    }, error => {
      console.log('LoadFeatureModel: ' + error);
    });
  }

  /**
   * Opens the delete modal to delete a business model decision.
   * @param featureId id of the current feature
   */
  deleteFeatureModal(featureId): void {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      this.modalFeature = featureModel.getFeature(featureId);
      this.modalReference = this.modalService.open(this.deleteModal, {size: 'lg'});
    }, error => {
      console.log('DeleteFeatureModal: ' + error);
    });
  }

  /**
   * Opens the add modal to add a business model decision.
   * @param featureId id of the current feature
   */
  addFeatureModal(featureId): void {
    console.log('Feature: ' + featureId);
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      this.modalFeature = featureModel.getFeature(featureId);
      this.modalUnselectedFeatures = this.getUnselectedFeatures(featureModel.getInstance(this.businessModelId), this.modalFeature);
      this.modalReference = this.modalService.open(this.addModal, {size: 'lg'});

    }, error => {
      console.log('DeleteFeatureModal: ' + error);
    });
  }

  /**
   * Add the current feature.
   */
  addFeature(): void {
    const featureName = this.addFeatureForm.value.featurename;
    this.pouchDBServer.addNewFeatureToInstance(
      this.featureModelId,
      featureName,
      FeatureType.OPTIONAL,
      null,
      this.modalFeature.id,
      this.businessModelId
    ).then(() => {
      this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
        this.modalFeature = featureModel.getFeature(this.modalFeature.id);
        this.modalUnselectedFeatures = this.getUnselectedFeatures(featureModel.getInstance(this.businessModelId), this.modalFeature);
        this.loadFeatureModel();
      }, error => {
        console.log('AddFeature (new load): ' + error);
      });
    }, error => {
      console.log('AddFeature: ' + error);
    });

    // Reset the form
    this.addFeatureForm.reset();
  }

  /**
   * Delete a business model decision.
   * @param featureId id of the current feature
   */
  deleteBusinessModelDecision(featureId: string): void {
    this.pouchDBServer.removeBusinessDecision(this.featureModelId, featureId, this.businessModelId).then(() => {
      this.closeModal();
    }, error => {
      console.log('DeleteBusinessModelDecision: ' + error);
    });
  }

  /**
   * Add a business model decision.
   * @param featureId id of the current feature
   */
  addBusinessModelDecision(featureId): void {
    this.pouchDBServer.addBusinessDecision(this.featureModelId, featureId, this.businessModelId).then(() => {
      this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
        this.modalFeature = featureModel.getFeature(this.modalFeature.id);
        this.modalUnselectedFeatures = this.getUnselectedFeatures(featureModel.getInstance(this.businessModelId), this.modalFeature);
        this.loadFeatureModel();
      }, error => {
        console.log('AddBusinessModelDecision (new load): ' + error);
      });
    }, error => {
      console.log('AddBusinessModelDecision: ' + error);
    });
  }

  /**
   * Update the business model.
   */
  updateBusinessModel() {
    this.pouchDBServer.updateBusinessModel(
      this.featureModelId,
      this.businessModelId,
      this.updateBusinessModelForm.value.name,
      this.updateBusinessModelForm.value.description
    ).then(() => {
      this.loadFeatureModel();
    }, error => {
      console.log('UpdateBusinessModel: ' + error);
    });
  }

  /**
   * Create adaptation of the business model.
   */
  createAdaptation() {
    const nameSplit = this.businessModelInstance.name.split(' - Adaptation#');
    let adaptationName;
    console.log(nameSplit.length);
    if (nameSplit.length > 1 && !isNaN(parseInt(nameSplit[nameSplit.length - 1], 10))) {
      adaptationName = nameSplit[0] + ' - Adaptation#' + (parseInt(nameSplit[nameSplit.length - 1], 10) + 1);
    } else {
      adaptationName = nameSplit[0] + ' - Adaptation#1';
    }

    this.pouchDBServer.adaptBusinessModel(this.featureModelId, this.businessModelId, adaptationName).then(() => {
      this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
        const businessModelKeys = featureModel.instances;
        this.router.navigateByUrl('/businessmodelview/' + this.featureModelId + '/' + businessModelKeys[businessModelKeys.length - 1].id);
      }, () => {
        console.log('CreateAdaptation (inner): ');
      });
    }, () => {
      console.log('CreateAdaptation: ');
    });
  }

  /**
   * Uncheck the conformance.
   */
  uncheckConformance() {
    this.conformanceIsChecked = false;
    this.conformance = {
      errorFeatureIds: [],
      errors: [],
      warningFeatureIds: [],
      warnings: [],
      strengthFeatureIds: [],
      strengths: [],
      hintFeatureIds: [],
      hints: []
    };
  }

  /**
   * Check the conformance.
   */
  checkConformance() {
    this.clearCompare();
    this.conformance = this.featureModel.checkConformanceOfInstance(this.businessModelId);
    this.conformanceIsChecked = true;
  }

  /**
   * Helper function to get all unselected subfeature from a feature.
   *
   * @param instance the business model instance
   * @param feature the feature
   */
  getUnselectedFeatures(instance: Instance, feature: Feature): Feature[] {
    return Object.values(feature.subfeatures).filter((f: Feature) => !instance.usedFeatures.includes(f.id));
  }

  /**
   * Closes the current modal.
   */
  closeModal() {
    this.modalReference.close();
    this.modalFeature = null;

    // Reload views
    this.loadFeatureModel();
  }

  /**
   * Compare this instance with another instance and generate a heatmap
   */
  compare() {
    this.uncheckConformance();
    const value: string[] = this.selectOtherInstanceForm.value.instance.split('%');
    const id = Number(value[1]);
    const expertModelId = value[0];
    if (expertModelId === 'own') {
      this.compareInstance = this.featureModel.getInstance(id);
      this.percentages = this.featureModel.compareInstances(this.businessModelInstance.id, this.compareInstance.id);
    } else {
      const expertInstance = this.instances[expertModelId].find((i) => i.id === id);
      this.compareInstance = this.featureModel.convertExpertInstance(expertModelId, expertInstance);
      this.percentages = this.featureModel.compareGivenInstances(this.businessModelInstance, this.compareInstance);
    }
    this.selectOtherInstanceForm.get('instance').disable();
  }

  /**
   * Clear comparison and remove heatmap
   */
  clearCompare() {
    this.compareInstance = null;
    this.percentages = null;
    this.selectOtherInstanceForm.get('instance').enable();
  }

  checkConvert(): Promise<void[]> {
    const promises: Promise<void>[] = [];
    this.instances = {};
    if (!this.featureModel.expertModel) {
      for (const expertModelId of Object.keys(this.featureModel.expertModelTraces)) {
        promises.push(this.pouchDBServer.getFeatureModel(expertModelId).then((expertModel) => {
          const featureIds = expertModel.getFeatureList().map((feature) => feature.id);
          if (featureIds.every((id) => id in this.featureModel.expertModelTraces[expertModel._id].expertFeatureIdMap)) {
            this.instances[expertModel._id] = expertModel.instances;
          }
        }));
      }
    }
    return Promise.all(promises);
  }

  asKeys(o) {
    return Object.keys(o);
  }

  getHeatmapStyle(featureId: string) {
    return this.percentages ? {'background-color': 'hsla(' + (this.percentages[featureId] / 100) * 120 + ', 100%, 66%, 0.3)'} : {};
  }
}
