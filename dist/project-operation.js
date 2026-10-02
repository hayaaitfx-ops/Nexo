import {readSections} from './explorer-model.js';
const batch='project-operation-v1';
export const operations={
 PCWise:'Você informa seu orçamento, uso e peças atuais. O site sugere uma montagem compatível, explica cada escolha e permite comparar upgrades. Com o mesmo perfil, você consulta desempenho estimado em jogos e segue perguntas para investigar problemas do PC.',
 DevWatch:'A equipe cadastra URLs e verificações importantes do produto. A cada publicação, registra a versão e compara os resultados antes e depois. Um painel relaciona falhas às mudanças e organiza atualizações de dependências em pequenos lotes verificáveis.',
 HomeBase:'Você cadastra cada objeto com foto, local onde foi guardado, nota fiscal e garantia. Busca ou etiqueta QR abre sua ficha. Quando algo quebra, registra orçamentos de assistência e compara conserto e substituição usando custo, idade e cobertura da garantia.',
 FoodLoop:'Você informa os alimentos disponíveis e suas validades. O site prioriza o que precisa ser usado, sugere receitas e lista só os ingredientes que faltam. Em uma expansão com comerciantes parceiros, mostra ofertas próximas da validade e permite reservar para retirada.',
 PriceHub:'Você busca um produto ou monta uma lista de compras. O site compara ofertas considerando frete, registra preços ao longo do tempo e envia um aviso quando atingem sua meta. Depois da compra, permite conferir o recibo e verificar se descontos e cupons foram aplicados.',
 ShareBlock:'Uma comunidade cria um catálogo dos objetos que seus membros aceitam emprestar. Quem precisa faz uma reserva e combina retirada e devolução. Se ninguém tiver o item, o grupo pode organizar uma compra coletiva, acompanhar cotas e definir o ponto de retirada.',
 MakerMatch:'Cada pessoa informa habilidades, interesses e disponibilidade. Quem propõe um projeto descreve o objetivo e os papéis necessários. O site sugere combinações; os participantes combinam uma tarefa piloto ou troca de conhecimento antes de assumir uma parceria maior.',
 ProductLab:'A equipe registra uma ideia ou briefing e transforma dúvidas em hipóteses e requisitos. Liga entrevistas e experimentos às evidências encontradas, define critérios de aceite e anota onde parou. Assim, cada decisão pode ser consultada junto de sua origem.',
 SafeCircle:'Você cola uma mensagem ou link suspeito e recebe uma revisão com sinais de risco e explicações. O site oferece um checklist para a negociação e sugere confirmar pedidos por outro canal. Opcionalmente, você pede uma segunda opinião a pessoas do seu círculo privado; a análise não garante que algo seja seguro.',
 PrivacyDesk:'Você registra os aplicativos que usa e revisa suas permissões com explicações simples. Antes de compartilhar um arquivo, uma verificação local procura possíveis dados pessoais ou segredos, mostra os trechos para conferência e ajuda a gerar uma cópia com as informações escolhidas removidas.',
 GameNight:'Cada amigo informa os jogos que possui. O grupo escolhe número de jogadores, plataformas e tempo disponível. O site cruza as bibliotecas, verifica opções de cooperação e crossplay e apresenta uma lista curta para todos votarem no jogo da sessão.',
 PlayDesk:'Você organiza seus jogos por progresso, duração e vontade de jogar. Ao informar o tempo disponível, recebe sugestões do próprio acervo. Para cada jogo, pode guardar perfis de mods e configurações de acessibilidade e registrar qual perfil usar ao retomar a sessão.',
 MoneyDesk:'Você cadastra assinaturas, datas de renovação e despesas individuais ou compartilhadas. O site mostra o custo mensal e divide gastos segundo as regras do grupo. Também calcula saldos e permite simular mudanças no orçamento antes de assumir um novo gasto.',
 CityLens:'Moradores marcam problemas e condições de caminhada em trechos do mapa, com data, foto e status. Relatos semelhantes são agrupados. Quem planeja um percurso escolhe suas necessidades e consulta obstáculos, sombra e locais de descanso, levando em conta a atualização dos relatos.',
 QueueLess:'O cliente entra na fila por QR ou com ajuda de um atendente e acompanha sua posição e uma estimativa de espera. O estabelecimento chama o próximo pelo painel; o cliente recebe um aviso. A equipe pode registrar ausências e ajustar o ritmo do atendimento.',
 FreelanceFlow:'O freelancer cadastra projetos, entregas, parcelas e despesas. Marca o que foi recebido e vê a previsão de caixa. Pode simular atrasos de clientes, identificar meses apertados e gerar um resumo dos valores e marcos pendentes para acompanhar cobranças.',
 SpoilerSafe:'Você informa até qual capítulo, episódio ou etapa chegou. O site organiza discussões por progresso e esconde conteúdos posteriores até você decidir revelá-los. Autores marcam o nível de spoiler e a comunidade pode denunciar marcações incorretas.',
 TimeCapsule:'Um grupo cria uma cápsula com tema e data de abertura, reúne mensagens e arquivos e acompanha as contribuições. O site prepara um pacote portátil para guardar uma cópia e oferece lembretes de preservação. A abertura na data combinada depende de manter o pacote acessível.'
};
export function fillOperations(project){
 if(project.contentBatches?.includes(batch))return 0;
 let count=0;
 for(const node of project.nodes){const text=operations[node.text];if(!text||readSections(node).operation.trim())continue;
 node.sections={...node.sections,operation:text};count++;}
 project.contentBatches=[...(project.contentBatches||[]),batch];if(count)project.updated=Date.now();return count;
}
export async function installOperations(workspace,backup){
 let count=0;
 for(let i=0;i<workspace.projects.length;i++){const project=workspace.projects[i];
 if(!project.contentBatches?.includes('software-ideas-compact-v1')||project.contentBatches.includes(batch))continue;
 const next=structuredClone(project),added=fillOperations(next);
 await backup(`before-${batch}-${project.id}`,structuredClone(project));workspace.projects[i]=next;count+=added;
 }return count;
}
