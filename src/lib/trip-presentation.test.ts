import { describe, expect, it } from "vitest";
import { tripBudget, tripDate, tripDuration, tripStatus } from "./trip-presentation";
describe("Apresentação pt-BR das viagens", () => {
  it("humaniza a data sem deslocamento de timezone", () => {
    expect(tripDate("2030-05-01")).toBe("1 de maio de 2030");
  });
  it("conta dias incluindo o primeiro e último, sem erro no horário de verão", () => {
    expect(tripDuration("2030-05-01", "2030-05-01")).toBe("1 dia");
    expect(tripDuration("2030-05-01", "2030-05-15")).toBe("15 dias");
    expect(tripDuration("2024-03-30", "2024-04-01")).toBe("3 dias");
  });
  it("distingue status, incluindo limites das datas", () => {
    expect(tripStatus("2030-05-01", "2030-05-15", "2030-04-30").label).toBe("Planejada");
    for (const date of ["2030-05-01", "2030-05-15"]) expect(tripStatus("2030-05-01", "2030-05-15", date).label).toBe("Em viagem");
    expect(tripStatus("2030-05-01", "2030-05-15", "2030-05-16").label).toBe("Concluída");
  });
  it("formata orçamento zero, ausente e moedas diferentes", () => {
    expect(tripBudget(2500.5, "BRL").replace(/\s/g, " ")).toBe("R$ 2.500,50");
    expect(tripBudget(0, "BRL")).toContain("0,00");
    expect(tripBudget(null, "BRL")).toBe("Não informado");
    expect(tripBudget(100, "EUR")).toContain("100,00");
    expect(tripBudget(100, "inválida")).toBe("Não informado");
  });
});
