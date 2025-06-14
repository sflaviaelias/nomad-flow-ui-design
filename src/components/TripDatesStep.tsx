
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays } from "lucide-react";

interface TripDatesStepProps {
  dates: { start: string; end: string; };
  onChange: (d: { start: string; end: string }) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TripDatesStep: React.FC<TripDatesStepProps> = ({
  dates,
  onChange,
  onNext,
  onPrev,
}) => (
  <div>
    <label className="block mb-2 font-medium flex items-center gap-2">
      <CalendarDays className="text-terracotta" /> Datas da Viagem
    </label>
    <div className="flex gap-2">
      <Input
        type="date"
        value={dates.start}
        onChange={e => onChange({ ...dates, start: e.target.value })}
        className="flex-1"
      />
      <Input
        type="date"
        value={dates.end}
        onChange={e => onChange({ ...dates, end: e.target.value })}
        className="flex-1"
      />
    </div>
    <div className="mt-4 flex gap-2">
      <Button variant="outline" onClick={onPrev}>Voltar</Button>
      <Button className="bg-terracotta" disabled={!dates.start || !dates.end} onClick={onNext}>
        Próxima <ArrowRight className="ml-1" />
      </Button>
    </div>
  </div>
);

export default TripDatesStep;

