import {ExamResponse} from '../../api/domain';
import {TranslateService} from '@ngx-translate/core';

export type ExamFaqItem = { question: string; answer: string };

export type ExamQuestionExample = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type ExamSeoContent = {
  intro: string[];
  studyTopics: string[];
  examStrategies: string[];
  faq: ExamFaqItem[];
  keywords: string[];
  exampleQuestion?: ExamQuestionExample;
};


export function getExamSeoContent(exam: ExamResponse | null | undefined, i18n?: TranslateService): ExamSeoContent {
  const slug = exam?.slug || '';

  const i18nInstant = (key: string, fallback: string) => i18n?.instant(key) || fallback;

  const generic: ExamSeoContent = {
    intro: [
      i18nInstant('seoContent.generic.intro1', 'Este simulado foi pensado para quem quer praticar com foco em certificações cloud, com questões objetivas, feedback e revisão rápida dos principais tópicos.'),
      i18nInstant('seoContent.generic.intro2', 'Ao longo desta página você encontra um guia prático de estudo, uma visão do que costuma ser cobrado e uma seção de perguntas frequentes para tirar dúvidas comuns antes do exame.')
    ],
    studyTopics: [
      i18nInstant('seoContent.generic.topic1', 'Fundamentos de computação em nuvem (IaaS, PaaS, SaaS, responsabilidade compartilhada).'),
      i18nInstant('seoContent.generic.topic2', 'Identidade e segurança: IAM, permissões, autenticação e boas práticas básicas.'),
      i18nInstant('seoContent.generic.topic3', 'Serviços core (compute, storage, networking) e casos de uso comuns.'),
      i18nInstant('seoContent.generic.topic4', 'Custos e billing: como estimar, otimizar e interpretar cobranças.'),
      i18nInstant('seoContent.generic.topic5', 'Boas práticas de arquitetura: alta disponibilidade, resiliência e observabilidade.')
    ],
    examStrategies: [
      i18nInstant('seoContent.generic.strategy1', 'Faça 1 simulado curto por dia e revise as explicações das questões erradas.'),
      i18nInstant('seoContent.generic.strategy2', 'Acompanhe seu progresso: reduza o tempo por questão sem perder precisão.'),
      i18nInstant('seoContent.generic.strategy3', 'Releia o enunciado procurando palavras-chave (sempre, nunca, melhor opção, mais barato).'),
      i18nInstant('seoContent.generic.strategy4', 'Antes de finalizar, revise respostas com baixa confiança.')
    ],
    faq: [
      {
        question: i18nInstant('seoContent.generic.faq1Question', 'Este simulado é gratuito?'),
        answer: i18nInstant('seoContent.generic.faq1Answer', 'Sim. Você pode iniciar um simulado e praticar. Em alguns fluxos pode existir cadastro opcional para salvar histórico/estatísticas.')
      },
      {
        question: i18nInstant('seoContent.generic.faq2Question', 'Quantas questões devo fazer por sessão?'),
        answer: i18nInstant('seoContent.generic.faq2Answer', 'Para consistência, 20–40 questões por sessão costuma funcionar bem. Para simular prova real, use 50–100 questões e mantenha o foco em tempo.')
      },
      {
        question: i18nInstant('seoContent.generic.faq3Question', 'As questões são iguais às do exame oficial?'),
        answer: i18nInstant('seoContent.generic.faq3Answer', 'Não. O objetivo é treinar os mesmos temas e o mesmo estilo de raciocínio — não replicar banco oficial.')
      },
      {
        question: i18nInstant('seoContent.generic.faq4Question', 'O que fazer depois do simulado?'),
        answer: i18nInstant('seoContent.generic.faq4Answer', 'Revise as explicações, anote os tópicos recorrentes e refaça um simulado focado nesses pontos até estabilizar seu desempenho.')
      }
    ],
    keywords: ['simulado', 'questões', 'certificação', 'cloud', 'treino', 'prova']
  };

  if (slug === 'aws-certified-cloud-practitioner-clf-c02') {
    return {
      intro: [
        i18nInstant('seoContent.clfC02.intro1', 'O simulado AWS Certified Cloud Practitioner CLF-C02 é uma das formas mais eficientes de se preparar para a certificação AWS de nível iniciante. Aqui você pratica com questões no estilo da prova real, focadas em conceitos fundamentais de cloud, segurança e custos.'),
        i18nInstant('seoContent.clfC02.intro2', 'Se você está buscando questões AWS Cloud Practitioner comentadas e quer entender como a prova realmente cobra os conteúdos, este simulado foi estruturado para desenvolver raciocínio e não apenas memorização.')
      ],
      studyTopics: [
        i18nInstant('seoContent.clfC02.topic1', 'Modelo de responsabilidade compartilhada da AWS: o que é responsabilidade do cliente vs da AWS.'),
        i18nInstant('seoContent.clfC02.topic2', 'IAM na prática: diferença entre usuários, grupos, roles e políticas — e erros comuns em permissões.'),
        i18nInstant('seoContent.clfC02.topic3', 'EC2 vs Lambda: quando usar computação sob demanda vs serverless.'),
        i18nInstant('seoContent.clfC02.topic4', 'S3, EBS e EFS: diferenças entre armazenamento de objetos, blocos e arquivos.'),
        i18nInstant('seoContent.clfC02.topic5', 'Custos na AWS: como funciona o modelo pay-as-you-go e como evitar cobranças inesperadas.'),
        i18nInstant('seoContent.clfC02.topic6', 'Alta disponibilidade: uso de múltiplas AZs e conceitos básicos de resiliência.'),
        i18nInstant('seoContent.clfC02.topic7', 'CloudFront e CDN: quando usar distribuição de conteúdo para reduzir latência.'),
        i18nInstant('seoContent.clfC02.topic8', 'Ferramentas de billing: Cost Explorer, Budgets e Trusted Advisor.')
      ],
      examStrategies: [
        i18nInstant('seoContent.clfC02.strategy1', 'Leia o enunciado procurando o objetivo principal: custo, performance, segurança ou simplicidade.'),
        i18nInstant('seoContent.clfC02.strategy2', 'Elimine alternativas claramente erradas antes de escolher a melhor resposta.'),
        i18nInstant('seoContent.clfC02.strategy3', 'Quando a pergunta falar de menor custo, priorize serviços gerenciados e serverless.'),
        i18nInstant('seoContent.clfC02.strategy4', 'Evite "overengineering": a AWS costuma cobrar a solução mais simples que resolve o problema.'),
        i18nInstant('seoContent.clfC02.strategy5', 'Se estiver em dúvida entre duas opções, escolha a que exige menos gerenciamento manual.')
      ],
      exampleQuestion: {
        question: i18nInstant('seoContent.clfC02.exampleQuestion', 'Uma aplicação precisa armazenar arquivos raramente acessados com o menor custo possível. Qual serviço é mais adequado?'),
        options: [
          'Amazon EC2',
          'Amazon S3 Glacier',
          'Amazon RDS',
          'AWS Lambda'
        ],
        correctAnswer: 'Amazon S3 Glacier',
        explanation: i18nInstant('seoContent.clfC02.exampleExplanation', 'O S3 Glacier é ideal para armazenamento de longo prazo com baixo custo. As outras opções não são otimizadas para armazenamento de arquivos raramente acessados.')
      },
      faq: [
        {
          question: i18nInstant('seoContent.clfC02.faq1Question', 'O simulado AWS CLF-C02 é gratuito?'),
          answer: i18nInstant('seoContent.clfC02.faq1Answer', 'Sim. Você pode fazer o simulado AWS Cloud Practitioner gratuitamente e praticar com questões similares às da prova real.')
        },
        {
          question: i18nInstant('seoContent.clfC02.faq2Question', 'Quantas questões tem a prova AWS Cloud Practitioner?'),
          answer: i18nInstant('seoContent.clfC02.faq2Answer', 'A prova oficial possui cerca de 65 questões, com duração de aproximadamente 90 minutos.')
        },
        {
          question: i18nInstant('seoContent.clfC02.faq3Question', 'Qual a pontuação mínima para passar no CLF-C02?'),
          answer: i18nInstant('seoContent.clfC02.faq3Answer', 'A pontuação mínima é 700 em uma escala de 100 a 1000.')
        },
        {
          question: i18nInstant('seoContent.clfC02.faq4Question', 'Este simulado AWS Cloud Practitioner tem questões comentadas?'),
          answer: i18nInstant('seoContent.clfC02.faq4Answer', 'Sim. O objetivo é que você entenda o motivo das respostas corretas e incorretas, acelerando seu aprendizado.')
        },
        {
          question: i18nInstant('seoContent.clfC02.faq5Question', 'Quanto tempo leva para se preparar para o CLF-C02?'),
          answer: i18nInstant('seoContent.clfC02.faq5Answer', 'Para iniciantes, entre 2 a 4 semanas de estudo consistente com prática diária em simulados costuma ser suficiente.')
        }
      ],
      keywords: [
        i18nInstant('seoContent.clfC02.keyword1', 'simulado aws clf-c02 gratuito'),
        i18nInstant('seoContent.clfC02.keyword2', 'simulado aws cloud practitioner gratuito'),
        i18nInstant('seoContent.clfC02.keyword3', 'questões aws cloud practitioner comentadas'),
        i18nInstant('seoContent.clfC02.keyword4', 'prova aws cloud practitioner simulador'),
        i18nInstant('seoContent.clfC02.keyword5', 'exame aws iniciante perguntas'),
        i18nInstant('seoContent.clfC02.keyword6', 'simulado certificação aws básico')
      ]
    };
  }

  return generic;
}

