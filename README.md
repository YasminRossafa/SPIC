# SPIC

Aplicativo de comunicação alternativa para crianças com TEA (Transtorno do Espectro Autista) baseado no método PECS (Picture Exchange Communication System).

O SPIC permite que terapeutas e familiares criem categorias e imagens personalizadas para auxiliar a comunicação de crianças não-verbais ou com dificuldades de fala, seguindo o fluxo de troca por figuras do método PECS.

## Tecnologias

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **Firebase** (Authentication, Cloud Firestore, Storage)
- **React Navigation** (native-stack)

## Instalação

1. Clone o repositório:

   ```bash
   git clone <url-do-repo>
   cd spic-app
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   Copie o arquivo `.env.example` para `.env` e preencha com as credenciais reais do seu projeto Firebase e do Google OAuth:

   ```bash
   cp .env.example .env
   ```

   Variáveis necessárias:

   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

   > **Importante**: o `.env` nunca deve ser commitado. Ele está listado no `.gitignore`.

4. Inicie o app:

   ```bash
   npx expo start --go
   ```

   - Pressione `w` para abrir no navegador
   - Escaneie o QR code com o Expo Go no celular (Android/iOS)

## Estrutura

```
src/
  config/       # Firebase e configurações
  contexts/     # AuthContext (estado global de autenticação)
  navigation/   # Stack navigators (Auth e App)
  screens/      # Telas organizadas por fluxo (auth, onboarding, app)
  services/     # Serviços de Firestore (categorias, imagens, auth)
  types/        # Tipagens compartilhadas
```
