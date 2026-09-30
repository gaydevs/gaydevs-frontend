import type { LoreProfile } from '../types/content'

export const lore: LoreProfile[] = [
  {
    name: 'Cleito', filename: 'cleito.json',
    attributes: { nome: 'Cleito', origem: 'uma brincadeira com ia de harness', cargo: 'mascote oficial do gaydevs', escolhido_por: 'votação dos gdevs' },
    paragraphs: [[{ text: 'uma piada sobre ' }, { text: '“ia de harness”', strong: true }, { text: ' virou personagem, ganhou nome numa votação e acabou oficializado como mascote do gaydevs.' }]],
  },
  {
    name: 'Alan Turing', filename: 'turing.json',
    attributes: { nome: 'Alan Turing', cargo: 'divo oficial do gaydevs', status: 'referência e inspiração' },
    paragraphs: [
      [{ text: 'antes mesmo do Cleito ganhar nome, Alan Turing já tinha sido escolhido pelos gdevs como nosso divo.' }],
      [{ text: 'porque ajudou a moldar a computação moderna e, por ser gay e ter sido perseguido por isso, virou uma referência que conecta tecnologia e história LGBT+.' }],
    ],
  },
]
