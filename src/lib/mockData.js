export const mockFiles = [
  {
    id: 'f1',
    name: 'Relatórios Financeiros 2026',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: new Date().toISOString(),
    size: null,
    children: [
      {
        id: 'f1-1',
        name: 'Q1_Projeções.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1500000,
        modifiedTime: new Date().toISOString(),
      },
      {
        id: 'f1-2',
        name: 'Auditoria_Interna.pdf',
        mimeType: 'application/pdf',
        size: 4200000,
        modifiedTime: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'f2',
    name: 'Design e Branding',
    mimeType: 'application/vnd.google-apps.folder',
    modifiedTime: new Date().toISOString(),
    size: null,
    children: [
      {
        id: 'f2-1',
        name: 'Logo_Principal_V4.png',
        mimeType: 'image/png',
        size: 850000,
        modifiedTime: new Date().toISOString(),
      },
      {
        id: 'f2-2',
        name: 'Paleta_Cores_Apple.pdf',
        mimeType: 'application/pdf',
        size: 1200000,
        modifiedTime: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'f3',
    name: 'Contratos_Clientes.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 450000,
    modifiedTime: new Date().toISOString(),
  },
  {
    id: 'f4',
    name: 'Video_Treinamento.mp4',
    mimeType: 'video/mp4',
    size: 45000000,
    modifiedTime: new Date().toISOString(),
  },
  {
    id: 'f5',
    name: 'Manual_do_Usuario.pdf',
    mimeType: 'application/pdf',
    size: 2100000,
    modifiedTime: new Date().toISOString(),
  }
];

export const mockEmails = [
  {
    id: '1',
    snippet: 'Prezado Alex, seguem as atualizações do sistema empresarial conforme solicitado...',
    payload: {
      headers: [
        { name: 'Subject', value: 'Atualização do Sistema - EmpresaOS' },
        { name: 'From', value: 'Diretoria <diretoria@empresa.com>' },
        { name: 'Date', value: new Date().toISOString() }
      ]
    }
  },
  {
    id: '2',
    snippet: 'A reunião de apresentação para o conselho foi agendada para amanhã...',
    payload: {
      headers: [
        { name: 'Subject', value: 'Agendamento: Reunião de Conselho' },
        { name: 'From', value: 'Secretaria <rh@empresa.com>' },
        { name: 'Date', value: new Date(Date.now() - 3600000).toISOString() }
      ]
    }
  }
];

export const mockReminders = [
  {
    _id: 'r1',
    title: 'Apresentação para o Chefe',
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending',
    description: 'Demonstrar o novo gerenciador de arquivos e design Apple.'
  },
  {
    _id: 'r2',
    title: 'Revisar metas trimestrais',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
    description: 'Focar nos KPIs de produtividade.'
  }
];

export const mockUser = {
  id: 'mock_123',
  name: 'Alex Alves',
  email: 'alex.alves@empresa.com',
  picture: 'https://ui-avatars.com/api/?name=Alex+Alves&background=1d1d1f&color=fff',
  isDemo: true
};
