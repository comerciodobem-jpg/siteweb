const phrases = {
  morning: [
    'Tudo começa nas suas mãos.',
    'Quem faz, faz a diferença.',
    'É daqui que o resultado começa.',
    'Produza com qualidade. Registre com responsabilidade.'
  ],
  afternoon: [
    'Seu trabalho faz a diferença até o último registro do dia.',
    'Pequenos registros, grandes resultados.',
    'Cada produção nos aproxima dos nossos objetivos.',
    'Você produz. Você registra. A gente cresce junto.'
  ]
};

export function motivationFor(date = new Date()) {
  const hour = date.getHours();
  const bucket = hour < 13 ? 'morning' : 'afternoon';
  const list = phrases[bucket];
  const index = date.getDay() % list.length;
  return list[index];
}
