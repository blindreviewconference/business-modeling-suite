import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PouchdbService } from '../pouchdb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feature-model',
  templateUrl: './feature-model.component.html',
  styleUrls: ['./feature-model.component.css']
})
/**
 * The FeatureModelComponent shows a starting page where all existing feature models can be discovered and
 * new feature models can be created.
 *
 * @author: Author removed due to blind review
 */
export class FeatureModelComponent {
  // List of expert models
  expertModelList: Array<any>;

  // List of company models
  companyModelList: Array<any>;

  /**
   * Create a new instance of the FeatureModelComponent.
   * @param fb FormBuilder
   * @param pouchDBServer PouchdbService
   * @param router Router
   */
  constructor(
    private fb: FormBuilder,
    private pouchDBServer: PouchdbService,
    private router: Router) {

    // Init default database
    this.pouchDBServer.getDatabaseInfo().then(result => {
      if (result.doc_count === 0) {
        this.pouchDBServer.addDefaultData().then(() => {
          this.refresh();
        }, error => {
          console.log('Default Constructor (inner): ' + error);
        });
      }
    }, error => {
      console.log('Default Constructor: ' + error);
    });

    this.refresh();
  }

  /**
   * Add a new expert model.
   *
   * @param name the name of the new expert model
   * @param description the description of the new expert model
   */
  addExpertModel(name: string, description: string): void {
    this.pouchDBServer.addFeatureModel(name, description, true).then(() => {
      this.refreshExpertModelList();
    }, error => {
      console.log('AddExpertModel: ' + error);
    });
  }

  /**
   * Add a new company model.
   *
   * @param name the name of the new feature model
   * @param description the description of the new feature model
   */
  addCompanyModel(name: string, description: string): void {
    this.pouchDBServer.addFeatureModel(name, description).then(() => {
      this.refreshCompanyModelList();
    }, error => {
      console.log('AddCompanyModel: ' + error);
    });
  }

  /**
   * Reset the local database.
   */
  resetDatabase(): void {
    console.log('Delete Database');
    this.pouchDBServer.addDefaultData().then(() => {
      this.refresh();
    }, error => {
      console.log('Default Constructor (inner): ' + error);
    });
  }


  /**
   * Navigate to a component to view the current feature model.
   * @param featureModelId id of the current feature model
   */
  viewFeatureModel(featureModelId: string): void {
    this.router.navigate(['/featuremodelview', featureModelId]);
  }

  /**
   * Navigate to a component to edit the current feature model.
   * @param featureModelId id of the current feature model
   */
  editFeatureModel(featureModelId: string): void {
    this.router.navigate(['/featuremodel', featureModelId]);
  }

  /**
   * Delete the current expert model
   *
   * @param featureModelId id of the current feature model
   */
  deleteExpertModel(featureModelId: string): void {
    this.pouchDBServer.deleteFeatureModel(featureModelId).then(() => {
      this.refreshExpertModelList();
    }, error => {
      console.log('DeleteExpertModel: ' + error);
    });
  }

  /**
   * Delete the current company model
   * @param featureModelId id of the current feature model
   */
  deleteCompanyModel(featureModelId: string): void {
    this.pouchDBServer.deleteFeatureModel(featureModelId).then(() => {
      this.refreshCompanyModelList();
    }, error => {
      console.log('DeleteCompanyModel: ' + error);
    });
  }

  /**
   * Refresh all lists.
   */
  private refresh() {
    this.refreshExpertModelList();
    this.refreshCompanyModelList();
  }

  /**
   * Refresh the expert model list.
   */
  refreshExpertModelList(): void {
    this.pouchDBServer.getExpertModelList().then(result => {
      this.expertModelList = result.docs;
    }, error => {
      console.log('RefreshExpertModelList: ' + error);
    });
  }

  /**
   * Refresh the feature model list.
   */
  refreshCompanyModelList(): void {
    this.pouchDBServer.getCompanyModelList().then(result => {
      this.companyModelList = result.docs;
    }, error => {
      console.log('RefreshCompanyModelList: ' + error);
    });
  }

}
