import {ExamResponse} from '../../api/domain';

export type ExamFaqItem = { question: string; answer: string };

export type ExamQuestionExample = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type ExamSeoContent = {
  /** Introdução (1-2 parágrafos). */
  intro: string[];
  /** Lista de tópicos/assuntos e como estudar. */
  studyTopics: string[];
  /** Dicas rápidas de prova/estratégia. */
  examStrategies: string[];
  /** FAQ para FAQPage JSON-LD e seção na página. */
  faq: ExamFaqItem[];
  /** Termos/keywords para enriquecer o texto. */
  keywords: string[];

  exampleQuestion?: ExamQuestionExample;
};

const generic: ExamSeoContent = {
  intro: [
    'Este simulado foi pensado para quem quer praticar com foco em certificações cloud, com questões objetivas, feedback e revisão rápida dos principais tópicos.',
    'Ao longo desta página você encontra um guia prático de estudo, uma visão do que costuma ser cobrado e uma seção de perguntas frequentes para tirar dúvidas comuns antes do exame.'
  ],
  studyTopics: [
    'Fundamentos de computação em nuvem (IaaS, PaaS, SaaS, responsabilidade compartilhada).',
    'Identidade e segurança: IAM, permissões, autenticação e boas práticas básicas.',
    'Serviços core (compute, storage, networking) e casos de uso comuns.',
    'Custos e billing: como estimar, otimizar e interpretar cobranças.',
    'Boas práticas de arquitetura: alta disponibilidade, resiliência e observabilidade.'
  ],
  examStrategies: [
    'Faça 1 simulado curto por dia e revise as explicações das questões erradas.',
    'Acompanhe seu progresso: reduza o tempo por questão sem perder precisão.',
    'Releia o enunciado procurando palavras-chave (sempre, nunca, melhor opção, mais barato).',
    'Antes de finalizar, revise respostas com baixa confiança.'
  ],
  faq: [
    {
      question: 'Este simulado é gratuito?',
      answer: 'Sim. Você pode iniciar um simulado e praticar. Em alguns fluxos pode existir cadastro opcional para salvar histórico/estatísticas.'
    },
    {
      question: 'Quantas questões devo fazer por sessão?',
      answer: 'Para consistência, 20–40 questões por sessão costuma funcionar bem. Para simular prova real, use 50–100 questões e mantenha o foco em tempo.'
    },
    {
      question: 'As questões são iguais às do exame oficial?',
      answer: 'Não. O objetivo é treinar os mesmos temas e o mesmo estilo de raciocínio — não replicar banco oficial.'
    },
    {
      question: 'O que fazer depois do simulado?',
      answer: 'Revise as explicações, anote os tópicos recorrentes e refaça um simulado focado nesses pontos até estabilizar seu desempenho.'
    }
  ],
  keywords: ['simulado', 'questões', 'certificação', 'cloud', 'treino', 'prova']
};

const registry: Record<string, ExamSeoContent> = {
  'aws-certified-cloud-practitioner-clf-c02': {
    intro: [
      'O simulado AWS Certified Cloud Practitioner CLF-C02 é uma das formas mais eficientes de se preparar para a certificação AWS de nível iniciante. Aqui você pratica com questões no estilo da prova real, focadas em conceitos fundamentais de cloud, segurança e custos.',
      'Se você está buscando questões AWS Cloud Practitioner comentadas e quer entender como a prova realmente cobra os conteúdos, este simulado foi estruturado para desenvolver raciocínio e não apenas memorização.'
    ],

    studyTopics: [
      'Modelo de responsabilidade compartilhada da AWS: o que é responsabilidade do cliente vs da AWS.',
      'IAM na prática: diferença entre usuários, grupos, roles e políticas — e erros comuns em permissões.',
      'EC2 vs Lambda: quando usar computação sob demanda vs serverless.',
      'S3, EBS e EFS: diferenças entre armazenamento de objetos, blocos e arquivos.',
      'Custos na AWS: como funciona o modelo pay-as-you-go e como evitar cobranças inesperadas.',
      'Alta disponibilidade: uso de múltiplas AZs e conceitos básicos de resiliência.',
      'CloudFront e CDN: quando usar distribuição de conteúdo para reduzir latência.',
      'Ferramentas de billing: Cost Explorer, Budgets e Trusted Advisor.'
    ],

    examStrategies: [
      'Leia o enunciado procurando o objetivo principal: custo, performance, segurança ou simplicidade.',
      'Elimine alternativas claramente erradas antes de escolher a melhor resposta.',
      'Quando a pergunta falar de menor custo, priorize serviços gerenciados e serverless.',
      'Evite “overengineering”: a AWS costuma cobrar a solução mais simples que resolve o problema.',
      'Se estiver em dúvida entre duas opções, escolha a que exige menos gerenciamento manual.'
    ],

    exampleQuestion: {
      question: 'Uma aplicação precisa armazenar arquivos raramente acessados com o menor custo possível. Qual serviço é mais adequado?',
      options: [
        'Amazon EC2',
        'Amazon S3 Glacier',
        'Amazon RDS',
        'AWS Lambda'
      ],
      correctAnswer: 'Amazon S3 Glacier',
      explanation: 'O S3 Glacier é ideal para armazenamento de longo prazo com baixo custo. As outras opções não são otimizadas para armazenamento de arquivos raramente acessados.'
    },

    faq: [
      {
        question: 'O simulado AWS CLF-C02 é gratuito?',
        answer: 'Sim. Você pode fazer o simulado AWS Cloud Practitioner gratuitamente e praticar com questões similares às da prova real.'
      },
      {
        question: 'Quantas questões tem a prova AWS Cloud Practitioner?',
        answer: 'A prova oficial possui cerca de 65 questões, com duração de aproximadamente 90 minutos.'
      },
      {
        question: 'Qual a pontuação mínima para passar no CLF-C02?',
        answer: 'A pontuação mínima é 700 em uma escala de 100 a 1000.'
      },
      {
        question: 'Este simulado AWS Cloud Practitioner tem questões comentadas?',
        answer: 'Sim. O objetivo é que você entenda o motivo das respostas corretas e incorretas, acelerando seu aprendizado.'
      },
      {
        question: 'Quanto tempo leva para se preparar para o CLF-C02?',
        answer: 'Para iniciantes, entre 2 a 4 semanas de estudo consistente com prática diária em simulados costuma ser suficiente.'
      }
    ],

    keywords: [
      'simulado aws clf-c02 gratuito',
      'simulado aws cloud practitioner gratuito',
      'questões aws cloud practitioner comentadas',
      'prova aws cloud practitioner simulador',
      'exame aws iniciante perguntas',
      'simulado certificação aws básico'
    ]
  }
};

export function getExamSeoContent(exam: ExamResponse | null | undefined): ExamSeoContent {
  const slug = exam?.slug || '';
  return registry[slug] ?? generic;
}

