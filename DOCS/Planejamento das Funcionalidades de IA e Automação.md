
# Planejamento das Funcionalidades de IA e Automação

## 1. Módulo de Upload e Processamento de Documentos

### 1.1. Lógica de Upload (Utils)
- **Descrição:** Implementação de um sistema robusto para upload de diversos tipos de documentos (comprovantes, extratos, contracheques, fotos).
- **Tecnologias:**
    - **Backend (FastAPI):** Utilização de `FastAPI.UploadFile` para receber os arquivos.
    - **Armazenamento:** Os arquivos serão armazenados em um serviço de armazenamento de objetos (ex: AWS S3, Google Cloud Storage, ou um diretório local seguro para prototipagem) para escalabilidade e segurança.
    - **Validação:** Validação de tipo de arquivo (PDF, JPG, PNG) e tamanho máximo no backend.
- **Fluxo:**
    1. Usuário faz upload do documento via frontend.
    2. Frontend envia o arquivo para um endpoint específico no backend.
    3. Backend valida o arquivo, armazena-o e registra metadados na tabela `DOCUMENTOS`.
    4. Uma tarefa assíncrona é disparada para processamento inteligente do documento.

### 1.2. Extração Inteligente de Dados de Contracheques
- **Descrição:** Sistema para ler e extrair automaticamente informações relevantes de contracheques (salário bruto, descontos, salário líquido, data de pagamento, etc.).
- **Tecnologias/Abordagens:**
    - **OCR (Optical Character Recognition):** Para converter imagens/PDFs de contracheques em texto. Bibliotecas como `Tesseract` (com `pytesseract` em Python) ou serviços de nuvem (Google Cloud Vision AI, AWS Textract) podem ser utilizados.
    - **Processamento de Linguagem Natural (NLP):** Após a extração do texto, técnicas de NLP (regex, reconhecimento de entidades nomeadas - NER, modelos de linguagem) serão usadas para identificar e extrair os campos específicos (ex: 


salário, descontos, etc.).
    - **Modelos de Machine Learning:** Para maior precisão, pode-se treinar modelos de ML (ex: usando `scikit-learn` ou `spaCy`) para reconhecer padrões em diferentes layouts de contracheques.
- **Integração:** Os dados extraídos serão mapeados para a estrutura de transações e entradas da aplicação, sugerindo ou criando automaticamente registros.

### 1.3. Extração Inteligente de Dados de Extratos Bancários
- **Descrição:** Sistema para ler e extrair automaticamente transações de extratos bancários (data, descrição, valor, tipo de transação).
- **Tecnologias/Abordagens:**
    - **OCR:** Similar aos contracheques, para converter extratos em texto.
    - **Processamento de Dados Estruturados:** Extratos bancários geralmente têm um formato mais tabular. Ferramentas que podem extrair dados de tabelas em PDFs (ex: `camelot-py`, `tabula-py`) serão úteis.
    - **Classificação de Transações:** Utilização de ML para classificar automaticamente as transações extraídas em categorias predefinidas (ex: 'Supermercado', 'Transporte') com base na descrição da transação.
- **Integração:** As transações extraídas serão sugeridas ao usuário para confirmação ou adicionadas automaticamente, com categorização prévia.

## 2. Considerações Gerais para IA e Automação
- **Feedback do Usuário:** É crucial que o usuário possa corrigir as extrações automáticas. Isso não só melhora a precisão dos dados, mas também pode ser usado para retreinar e melhorar os modelos de IA ao longo do tempo (Human-in-the-Loop).
- **Privacidade e Segurança:** Garantir que os dados sensíveis extraídos sejam tratados com a máxima segurança e privacidade, seguindo as regulamentações de proteção de dados.
- **Processamento Assíncrono:** O processamento de documentos pode ser demorado. Deve ser feito de forma assíncrona (ex: usando `Celery` com `Redis` ou `RabbitMQ` como broker) para não bloquear a interface do usuário.
- **Limpeza e Normalização de Dados:** Antes de usar os dados extraídos, é essencial realizar etapas de limpeza e normalização para garantir consistência e qualidade.


