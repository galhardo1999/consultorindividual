Melhore a exibição dos valores dos imóveis nos cards das páginas `/imoveis` e `/imoveis/{id}`.

Atualmente, quando um imóvel possui a finalidade **Venda e Locação**, o card não está exibindo corretamente o valor do aluguel.

Ajuste o comportamento para que:

- Quando a finalidade for **Venda**, exibir apenas o valor de venda.
- Quando a finalidade for **Locação**, exibir apenas o valor do aluguel.
- Quando a finalidade for **Venda e Locação**, exibir os dois valores no card:
  - Valor de venda
  - Valor de aluguel

Exemplo de exibição esperada no card:

```txt
Venda: R$ 850.000,00
Aluguel: R$ 3.500,00/mês