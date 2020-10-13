import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FeatureModelComponent } from './feature-model/feature-model.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatureModelDetailComponent } from './feature-model-detail/feature-model-detail.component';
import { FeatureTreeComponent } from './feature-tree/feature-tree.component';
import { FeatureModelViewComponent } from './feature-model-view/feature-model-view.component';
import { FeatureBuildingBlockComponent } from './feature-building-block/feature-building-block.component';
import { BusinessModelViewComponent } from './business-model-view/business-model-view.component';
import { CanvasBuildingBlockComponent } from './canvas-building-block/canvas-building-block.component';
import { ToolExplanationComponent } from './tool-explanation/tool-explanation.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModelListComponent } from './model-list/model-list.component';
import { MergeModelViewComponent } from './merge-model-view/merge-model-view.component';
import { MergeTreeComponent } from './merge-tree/merge-tree.component';
import { MergeIntoTreeComponent } from './merge-into-tree/merge-into-tree.component';
import { TraceModalComponent } from './trace-modal/trace-modal.component';
import { FeatureFormComponent } from './feature-form/feature-form.component';
import { DeleteFeatureConfirmComponent } from './delete-feature-confirm/delete-feature-confirm.component';
import { ModelImportViewComponent } from './model-import-view/model-import-view.component';
import { CrossTreeRelationshipFormComponent } from './cross-tree-relationship-form/cross-tree-relationship-form.component';
import { CrossTreeRelationshipModalComponent } from './cross-tree-relationship-modal/cross-tree-relationship-modal.component';
import { AuthorFormComponent } from './author-form/author-form.component';
import { InstanceListComponent } from './instance-list/instance-list.component';
import { ModelInfoBoxComponent } from './model-info-box/model-info-box.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthorFormComponent,
    DeleteFeatureConfirmComponent,
    CrossTreeRelationshipFormComponent,
    CrossTreeRelationshipModalComponent,
    FeatureFormComponent,
    FeatureModelComponent,
    FeatureModelDetailComponent,
    FeatureTreeComponent,
    FeatureBuildingBlockComponent,
    FeatureModelViewComponent,
    BusinessModelViewComponent,
    CanvasBuildingBlockComponent,
    ToolExplanationComponent,
    MergeIntoTreeComponent,
    MergeModelViewComponent,
    MergeTreeComponent,
    ModelInfoBoxComponent,
    ModelListComponent,
    TraceModalComponent,
    ModelImportViewComponent,
    InstanceListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
