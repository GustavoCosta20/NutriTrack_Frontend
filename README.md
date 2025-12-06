<img width="1032" height="270" alt="rfc" src="https://github.com/user-attachments/assets/45bec75b-940c-4196-81c3-9725b6772b33" />

# NutriTrack-Frontend-TCC
> Interface web do Sistema de Acompanhamento Nutricional com IA – Desenvolvido por Gustavo Costa

<br>

## 🔎 Visão Geral
Este repositório contém o **frontend do NutriTrack**, desenvolvido em **Angular**, responsável pela interface de interação com o usuário.

O sistema revoluciona o acompanhamento dietético, ele calcula metas personalizadas automaticamente com base nas informações do usuário e faz a integração com **Inteligência Artificial (Google Gemini)** para registrar refeições via chat, eliminando a complexidade de tabelas manuais. Além disso, o assistente virtual oferece sugestões de alimentos e dietas alinhadas ao objetivo do usuário, enquanto dashboards interativos garantem o monitoramento preciso de macronutrientes em tempo real.

<br>

## 🎨 Tecnologias Utilizadas
- **Angular 16+**
- **TypeScript**
- **SCSS / HTML5**
- **Consumo de API REST (Integração com IA)**
- **Karma para testes unitários**

<br>

## 🛠️ Como rodar o projeto localmente

### ✔ Pré-requisitos:
- Node.js LTS
- Angular CLI
- Backend NutriTrack em execução (Local ou Azure)

## Gerar componentes:
Run `ng generate` para gerar um novo componente. Você também pode usar: `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Rodando o projeto:
```bash
# 1. Clone o repositório
git clone [https://github.com/GustavoCosta20/NutriTrack_Frontend.git](https://github.com/GustavoCosta20/NutriTrack_Frontend.git)

# 2. Acesse o diretório
cd NutriTrack_Frontend

# 3. Instale as dependências
npm install

# 4. Configure o arquivo de ambiente
# Edite: src/environments/environment.ts
# Certifique-se de que a 'apiUrl' aponta para o seu backend (https://localhost:5243)

# 5. Execute o servidor de desenvolvimento
ng serve

# Aplicação disponível em:
http://localhost:4200/

## Rodar testes unitários
Run `ng test` para executar os testes unitários via [Karma](https://karma-runner.github.io).
```

### 🔗 Backend: [Acessar repositório](https://github.com/GustavoCosta20/NutriTrack_Backend.git)
### 🔗 Aplicação: [Acessar Site](https://nutritrack-lifestyle.vercel.app/login)
### 🔗 Documentação RFC: [Acessar documento RFC](https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL2IvYy82MTBlYjk3MTZkMjBiYWZjL0lRQlZTZ05aRXdPd1NaN0hBLUNqT1F6c0FYeHRXX3R5SWZscXNlU2VIdDYxVWNVP2U9VU5HSHMz&cid=610EB9716D20BAFC&id=610EB9716D20BAFC%21s59034a55031349b09ec703e0a3390cec&parId=610EB9716D20BAFC%21sea8cc6beffdb43d7976fbc7da445c639&o=OneUp)
