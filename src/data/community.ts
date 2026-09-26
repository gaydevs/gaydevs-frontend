import type { CommunitySpace } from '../types/content'

export const community: CommunitySpace[] = [
  {
    path: '/gdevs', commands: ['$ cd /gdevs', '$ cat README.md'], label: 'grupo principal · SFW',
    description: 'tecnologia, carreira, IA, código,\noportunidades e o dia a dia da comunidade',
  },
  {
    path: '/gdevs/off-topic-nsfw', commands: ['$ cd /gdevs/off-topic-nsfw', '$ cat README.md'], label: 'social · NSFW',
    description: 'o espaço separado para conversas\nque não cabem no grupo principal',
  },
  {
    path: '/gdevs/talks/international-career', commands: ['$ cd /gdevs/talks/international-career', '$ cat README.md'],
    label: 'gdevs talks · internacionalização de carreira',
    description: 'encontro agendado com jogaydev para quebrar o gelo\n+ conversa sobre internacionalização de carreira',
  },
  {
    path: '/gdevs/summit', commands: ['$ cd /gdevs/summit', '$ cat README.md'], label: 'gdevs summit',
    description: 'espaço dedicado à organização\ndas apresentações dos gdevs',
  },
]
