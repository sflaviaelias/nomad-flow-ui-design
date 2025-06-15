
import React from "react";
import SmartTripToggle from "./SmartTripToggle";

interface TripIntelligentStepProps {
  value: boolean;
  onChange: (val: boolean) => void;
}

const TripIntelligentStep: React.FC<TripIntelligentStepProps> = ({ value, onChange }) => (
  <div className="mb-2">
    <SmartTripToggle value={value} onChange={onChange} />
  </div>
);

export default TripIntelligentStep;
