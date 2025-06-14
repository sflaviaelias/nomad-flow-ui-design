
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Users, CircleCheck } from "lucide-react";

interface ContextModalProps {
  open: boolean;
  onClose: () => void;
  userContext: {
    name: string;
    destination: string;
    budget: string;
    currency: string;
    weather: string;
  };
}

const ConciergeContextModal: React.FC<ContextModalProps> = ({ open, onClose, userContext }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-terracotta">Contexto do Usuário</DialogTitle>
        <DialogDescription className="text-neutral-700">
          Todas as respostas do concierge consideram seu contexto atual.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div className="flex items-center gap-3">
          <Users className="text-terracotta" /> <span className="font-medium">{userContext.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="text-terracotta" /> <span>Destino: <b>{userContext.destination}</b></span>
        </div>
        <div className="flex items-center gap-3">
          <CircleCheck className="text-terracotta" /> <span>Orçamento: <b>{userContext.budget} {userContext.currency}</b></span>
        </div>
        <div className="flex items-center gap-3">
          <span role="img" aria-label="weather" className="text-xl">☀️</span> <span>Clima: {userContext.weather}</span>
        </div>
      </div>
      <div className="pt-4 text-center text-xs text-muted-foreground">
        Personalize esse contexto acessando seu perfil ou detalhes da viagem.
      </div>
    </DialogContent>
  </Dialog>
);

export default ConciergeContextModal;
