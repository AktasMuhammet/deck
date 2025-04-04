import type { IController, IScope } from 'angular';
import { copy, module } from 'angular';
import type { IModalServiceInstance } from 'angular-ui-bootstrap';

import type { Application } from '@spinnaker/core';
import { ManifestWriter, TaskMonitor } from '@spinnaker/core';
import type { IManifestCoordinates } from '../IManifestCoordinates';
import { KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM } from './scaleSettingsForm.component';

export interface IScaleCommand {
  manifestName: string;
  location: string;
  account: string;
  reason: string;
  replicas: number;
}

class KubernetesManifestScaleController implements IController {
  public taskMonitor: TaskMonitor;
  public verification = {
    verified: false,
  };

  public static $inject = ['$scope', 'coordinates', 'currentReplicas', '$uibModalInstance', 'application'];
  constructor(
    private $scope: IScope,
    coordinates: IManifestCoordinates,
    currentReplicas: number,
    private $uibModalInstance: IModalServiceInstance,
    private application: Application,
  ) {
    this.taskMonitor = new TaskMonitor({
      title: `Scaling ${coordinates.name} in ${coordinates.namespace}`,
      application,
      modalInstance: $uibModalInstance,
    });

    this.$scope.command = {
      manifestName: coordinates.name,
      location: coordinates.namespace,
      account: coordinates.account,
      reason: null,
      replicas: currentReplicas,
    };

    // used by react components to update command fields in parent (angular) scope
    this.$scope.onChange = () => {
      this.$scope.$applyAsync();
    };
  }

  public isValid(): boolean {
    return this.verification.verified;
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  public scale(): void {
    this.taskMonitor.submit(() => {
      const payload = copy(this.$scope.command) as any;
      payload.cloudProvider = 'kubernetes';

      return ManifestWriter.scaleManifest(payload, this.application);
    });
  }
}

export const KUBERNETES_MANIFEST_SCALE_CTRL = 'spinnaker.kubernetes.v2.manifest.scale.controller';

module(KUBERNETES_MANIFEST_SCALE_CTRL, [KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM]).controller(
  'kubernetesV2ManifestScaleCtrl',
  KubernetesManifestScaleController,
);
