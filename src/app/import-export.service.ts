import { Injectable } from '@angular/core';
import Ajv from 'ajv';
import schema from '../assets/schema_beta.json';
import { FeatureModel } from './model/feature-model';
import { PouchdbService } from './pouchdb.service';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  private ajv = new Ajv();

  constructor(
    private pouchdbService: PouchdbService
  ) {
  }

  exportModel(featureModelId: string) {
    this.pouchdbService.getFeatureModel(featureModelId).then((featureModel) => {
      const json = new Blob([JSON.stringify(featureModel, null, 2)], {type: 'application/json'});
      saveAs(json, featureModel.name + '.json');
    }).catch(error => {
      console.log(error);
    });
  }

  /**
   * Imports a model into pouchdb after checking the format and consistency
   *
   * @param file the file which includes the model as json
   * @param expertModel whether it is an expert model
   * @return promise of the new feature model
   */
  importModel(file, expertModel: boolean): Promise<FeatureModel> {
    return this.importJson(file).then((json) => {
      const featureModel = new FeatureModel(json);
      featureModel.expertModel = expertModel;
      featureModel.checkFormalConsistency();
      return this.pouchdbService.db.post(featureModel.toPouchDb()).then((postResult) => this.pouchdbService.getFeatureModel(postResult.id));
    });
  }

  /**
   * Imports JSON from a file and checks against the schema for models.
   *
   * @param file the file to read the JSON from
   */
  private importJson(file): Promise<any> {
    return new Promise((resolve, reject) => {
      const validate = this.ajv.compile(schema);
      const fileReader = new FileReader();
      fileReader.addEventListener('error', () => {
        reject('Error loading file');
      });
      fileReader.addEventListener('load', (event: any) => {
        let json = null;
        try {
          json = JSON.parse(event.target.result);
        } catch (error) {
          reject(error);
          return;
        }
        const valid = validate(json);
        if (!valid) {
          reject(validate.errors);
        } else {
          resolve(json);
        }
      });
      fileReader.readAsText(file);
    });
  }
}
