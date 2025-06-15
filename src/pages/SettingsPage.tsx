
import React from "react";
import { Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [notifications, setNotifications] = React.useState<boolean>(true);
  const [location, setLocation] = React.useState<boolean>(false);

  // Só exibe toast ou feedback real se você desejar implementar no futuro.
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // ex: trigger toast("Configurações salvas!")
  };

  return (
    <main className="flex flex-col min-h-screen bg-background font-inter">
      {/* Cabeçalho */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-3 bg-[#FCF7F4] shadow-soft">
        <span className="mb-2 rounded-full p-2 bg-[#E76F51]/10 flex items-center">
          <Bell size={30} className="text-terra-600" />
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-terra-800">
          Configurações
        </h1>
      </div>
      {/* Conteúdo Scrollable */}
      <form
        onSubmit={handleSave}
        className="flex-1 w-full max-w-xl mx-auto px-5 py-7 flex flex-col gap-0"
        style={{ minHeight: 0 }}
      >
        {/* Notificações */}
        <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
          <div className="flex-1 flex flex-col">
            <span className="font-medium text-base text-terra-900">
              Ativar notificações
            </span>
            <span className="text-sm text-neutral-500">Receba avisos importantes sobre sua viagem</span>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            id="toggle-notifications"
            aria-label="Ativar notificações"
            className="ml-2 data-[state=checked]:bg-[#E76F51] data-[state=checked]:border-[#E76F51]"
          />
        </div>

        <Separator className="my-6 bg-[#dadada]" />

        {/* Localização */}
        <div className="bg-white rounded-xl px-4 py-5 shadow-card flex items-center">
          <div className="flex-1 flex flex-col">
            <span className="font-medium text-base text-terra-900">
              Compartilhar localização
            </span>
            <span className="text-sm text-neutral-500">
              Melhore recomendações com base onde você está
            </span>
          </div>
          <Switch
            checked={location}
            onCheckedChange={setLocation}
            id="toggle-location"
            aria-label="Compartilhar localização"
            className="ml-2 data-[state=checked]:bg-[#E76F51] data-[state=checked]:border-[#E76F51]"
          />
        </div>

        {/* Espaço extra para garantir visualização do botão fixo */}
        <div className="h-32" />
      </form>
      {/* Botão Fixo */}
      <div className="fixed left-0 right-0 bottom-0 bg-background/95 border-t border-[#E76F51]/10 px-6 py-5 flex justify-center z-50 shadow-soft">
        <Button
          type="submit"
          form="form-settings"
          className="w-full max-w-xl text-white bg-terra-600 hover:bg-terra-700 font-semibold py-3 rounded-lg shadow-xl"
          size="lg"
        >
          Salvar alterações
        </Button>
      </div>
    </main>
  );
}
