
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliciesPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background font-inter">
      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 bg-[#FCF7F4] shadow-soft">
        <ShieldCheck size={44} className="text-terra-600 mb-2" />
        <h1 className="text-2xl md:text-3xl font-bold text-terra-800">
          Termos e Políticas
        </h1>
      </div>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1 px-5 pt-6 pb-[100px] max-w-xl mx-auto w-full">
        <div className="text-base text-[#3E2C23] leading-relaxed space-y-5">
          <p>
            Bem-vindo ao Go Nomad! Estes termos e políticas descrevem as regras e diretrizes para uso do nosso aplicativo.
          </p>
          <p>
            <strong>1. Condições Gerais</strong>
            <br />
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi dapibus velit vel dictum cursus. Etiam nec cursus lorem, et maximus eros. Integer hendrerit risus viverra, gravida enim in, tincidunt eros.
          </p>
          <p>
            <strong>2. Privacidade dos Dados</strong>
            <br />
            Praesent facilisis volutpat metus, at accumsan enim euismod id. Nullam vel elit vitae nisi cursus blandit in ac velit.
          </p>
          <p>
            <strong>3. Responsabilidades do Usuário</strong>
            <br />
            Quisque pharetra sapien in metus euismod, at faucibus lorem euismod. Etiam efficitur tincidunt tellus, non commodo neque.
          </p>
          <p>
            <strong>4. Uso de IA e Dados</strong>
            <br />
            Morbi cursus accumsan faucibus. Cras efficitur, lacus in bibendum dictum, nulla erat dictum massa, ac tincidunt enim est vitae nisl.
          </p>
          <p>
            <strong>5. Alterações nos Termos</strong>
            <br />
            Nunc euismod diam a neque ultricies, eu euismod enim dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
          </p>
          <p>
            Em caso de dúvidas, entre em contato com nosso suporte.
          </p>
        </div>
      </ScrollArea>
      {/* Fixed Button */}
      <div className="fixed left-0 right-0 bottom-0 bg-background/90 border-t border-[#E76F51]/15 px-6 py-5 flex justify-center z-50">
        <Button
          className="w-full max-w-xl text-white bg-terra-600 hover:bg-terra-700 font-semibold py-3 rounded-lg shadow-xl"
          size="lg"
        >
          Concordo com os termos
        </Button>
      </div>
    </main>
  );
}
