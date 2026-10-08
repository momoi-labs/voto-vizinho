/** Textos da interface (ASCII + escapes Unicode = UTF-8 correto no bundle). */
export const UI = {
  voceAqui: 'Voc\u00ea est\u00e1 aqui',
  suaBusca: 'Sua busca',
  movaMapa: 'Mova o mapa para ver locais',
  aproximeMapa: 'Aproxime o mapa para ver os locais',
  naAreaDoMapa: 'Na \u00e1rea do mapa',
  locaisNaArea: 'Locais na \u00e1rea do mapa',
  visualizacao: 'Visualiza\u00e7\u00e3o',
  usarLocalizacao: 'Usar minha localiza\u00e7\u00e3o',
  votosFlavio: 'Votos Fl\u00e1vio',
  menorNumeroVirar: 'Menor n\u00famero de votos a virar primeiro.',
  diferenca: 'Diferen\u00e7a',
  naoBasta: 'n\u00e3o basta',
  ondeLulaVence: '\u2605 Onde Lula j\u00e1 vence',
  marcadorLulaVence: '\u2605',
  sep: '\u00b7',
  travessao: '\u2014',
  cepNumeros: 'Digite um CEP com 8 n\u00fameros.',
  procurandoCep: 'Procurando o CEP\u2026',
  falhaCep: 'Falha ao buscar CEP.',
  erroCarregarDados: 'Erro ao carregar dados.',
  erroLocalizacao: 'Erro de localiza\u00e7\u00e3o.',
  erroObterLocalizacao: 'Erro ao obter localiza\u00e7\u00e3o.',
  geoIndisponivel: 'Geolocaliza\u00e7\u00e3o indispon\u00edvel.',
  geoNaoPossivel: 'N\u00e3o foi poss\u00edvel usar sua localiza\u00e7\u00e3o.',
  geoNegada:
    'Permiss\u00e3o de localiza\u00e7\u00e3o negada. Libere no navegador (\u00edcone ao lado do endere\u00e7o) ou busque por CEP.',
  cepConsultaFalha: 'N\u00e3o foi poss\u00edvel consultar o CEP.',
  cepNaoEncontrado: 'CEP n\u00e3o encontrado.',
  enderecoNaoMapa: 'N\u00e3o achamos esse endere\u00e7o no mapa.',
  eleicoes2026: 'Elei\u00e7\u00f5es 2026 \u00b7 1\u00ba turno para presidente',
  blocoVotacao:
    'Encontre os locais de vota\u00e7\u00e3o perto de voc\u00ea e veja onde cada conversa pode virar o resultado.',
  dadosTse:
    'Dados abertos do TSE \u00b7 1\u00ba turno 2026 \u00b7 Presidente \u00b7 todo o Brasil.',
  fraseVirar: (n: string) =>
    `VIRANDO ${n} VOTOS, LULA VENCE NESTA \u00c1REA`,
  fraseLulaVence: (n: string) => `LULA VENCE NESTA \u00c1REA POR ${n} VOTOS`,
  locaisOrdenados: (n: number) =>
    `${n} locais \u00b7 ordenados por votos a virar`,
  flavioBolsonaro: 'Fl\u00e1vio Bolsonaro',
  dadoFicticio: 'Dado fict\u00edcio',
  localVotacao: 'Local de vota\u00e7\u00e3o',
  eleitoresAptos: 'eleitores aptos',
  brancosNulos: (b: string, n: string) => `${b} brancos \u00b7 ${n} nulos`,
  abstencoes: 'Absten\u00e7\u00f5es (n\u00e3o foram votar)',
  lulaVenceAqui: (n: string) => `Lula vence aqui por ${n} votos`,
  paraLulaVencer: 'Para Lula vencer aqui',
  soConquistarNaoBasta: 'S\u00f3 conquistar n\u00e3o basta',
  reservaConquistar: (reserva: string, conquistar: string) =>
    `Aqui h\u00e1 ${reserva} votos para conquistar e seriam precisos ${conquistar}.`,
  diferencaAptos: (pct: string) =>
    `Diferen\u00e7a: ${pct} dos eleitores aptos`,
  tseTurno: 'TSE \u00b7 1\u00ba turno 2026',
  tooltipVotos: (flavio: string, lula: string) =>
    `Fl\u00e1vio Bolsonaro ${flavio} \u00b7 Lula ${lula}`,
} as const;

export const TEXTOS = {
  animo:
    'N\u00e3o desanime: cada voto virado conta em dobro \u2014 sai um de Fl\u00e1vio e entra um para Lula. Uma boa conversa com um vizinho vale por duas.',
  mantenha:
    'Mantenha a conversa com seus vizinhos para essa vantagem continuar \u2014 e crescer.',
  virarExp: 'pessoas que votaram em Fl\u00e1vio passam a votar em Lula',
  conquistarExp:
    'entre quem votou branco, nulo, em outro candidato ou n\u00e3o foi votar',
} as const;
