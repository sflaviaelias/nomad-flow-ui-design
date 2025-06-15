
import React from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  name: string;
  setName: (n: string) => void;
  userEmail?: string;
  nationality: string;
  setNationality: (v: string) => void;
  countryList: string[];
  errors: { [k: string]: string | null };
  birthDate: Date | null;
  setBirthDate: (d: Date | null) => void;
}

export function ProfilePersonalInfoForm({
  name,
  setName,
  userEmail,
  nationality,
  setNationality,
  countryList,
  errors,
  birthDate,
  setBirthDate
}: Props) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  return (
    <section className="flex flex-col gap-4">
      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">
          Nome<span className="ml-0.5 text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          className={`bg-[#FAF3EC] border-terra-900/10 focus-visible:ring-2 focus-visible:ring-terra-600 text-base ${errors.name ? 'border-red-500' : ''}`}
          required
        />
        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
      </div>
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">
          E-mail<span className="ml-0.5 text-red-500">*</span>
        </label>
        <Input
          value={userEmail || ""}
          readOnly
          tabIndex={-1}
          className="bg-[#FAF3EC] text-terra-700 border-terra-900/10 cursor-not-allowed"
          aria-disabled="true"
        />
      </div>
      {/* Nacionalidade */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">
          Nacionalidade<span className="ml-0.5 text-red-500">*</span>
        </label>
        <select
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          className={`w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base ${errors.nationality ? 'border-red-500' : ''}`}
          required
          style={{ minHeight: 44 }}
        >
          {countryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.nationality && <span className="text-red-500 text-xs">{errors.nationality}</span>}
      </div>
      {/* Data Nascimento */}
      <div className="flex flex-col gap-1">
        <label className="text-terra-900 font-medium text-sm font-inter">
          Data de Nascimento<span className="ml-0.5 text-red-500">*</span>
        </label>
        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full rounded-md bg-[#FAF3EC] border-terra-900/10 px-3 py-2 text-base flex items-center justify-between",
                !birthDate && "text-muted-foreground",
                errors.birthDate ? "border-red-500" : ""
              )}
              style={{ minHeight: 44 }}
              aria-label="Selecionar data de nascimento"
            >
              {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
              <CalendarIcon size={18} className="ml-2 text-terra-600" />
            </button>
          </DialogTrigger>
          <DialogContent className="w-auto max-w-xs p-0 rounded-xl shadow-soft bg-white z-30">
            <div className="p-4">
              <Calendar
                mode="single"
                selected={birthDate || undefined}
                onSelect={date => {
                  setBirthDate(date);
                  setCalendarOpen(false);
                }}
                disabled={date =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                className="pointer-events-auto"
              />
              <button
                className="w-full mt-2 py-2 bg-terra-600 rounded-lg text-white font-medium font-inter"
                type="button"
                onClick={() => setCalendarOpen(false)}
              >
                Fechar
              </button>
            </div>
          </DialogContent>
        </Dialog>
        {errors.birthDate && <span className="text-red-500 text-xs">{errors.birthDate}</span>}
      </div>
    </section>
  );
}
