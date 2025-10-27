// components/cockpit/MapAndDiagnosisTab.tsx
import React from 'react';
import { StrategicModel, SixVariablesModel } from '../../types.ts';
import StrategicMap from '../StrategicMap.tsx';
import SixVariablesNavigator from '../SixVariablesNavigator.tsx';

interface MapAndDiagnosisTabProps {
  strategicModel: StrategicModel;
  sixVariablesModel: SixVariablesModel;
  selectedNodeId: string | null;
  selectedVariableId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onVariableSelect: (variableId: string) => void;
}

const MapAndDiagnosisTab: React.FC<MapAndDiagnosisTabProps> = ({
  strategicModel,
  sixVariablesModel,
  selectedNodeId,
  selectedVariableId,
  onNodeSelect,
  onVariableSelect,
}) => {
  return (
    <div className="h-full w-full overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden aspect-[1.6]">
        <StrategicMap 
          model={strategicModel} 
          onNodeSelect={onNodeSelect} 
          selectedNodeId={selectedNodeId} 
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mt-24">
        <div className="max-w-sm mx-auto pt-20 pb-12">
          <SixVariablesNavigator 
            model={sixVariablesModel} 
            onVariableSelect={onVariableSelect} 
            selectedVariableId={selectedVariableId}
          />
        </div>
      </div>
    </div>
  );
};

export default MapAndDiagnosisTab;