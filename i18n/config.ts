import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav.home": "Home",
      "nav.explore": "Explore",
      "nav.upload": "Upload",
      "nav.profile": "Profile",
      "nav.login": "Login",
      "nav.logout": "Logout",
      "home.welcome": "Welcome to U-Fi",
      "home.feed": "Your Feed",
      "upload.title": "Upload New Track",
      "upload.dragDrop": "Drag and drop or click to select",
      "upload.audio": "Audio File",
      "upload.cover": "Cover Image",
      "upload.submit": "Publish Track",
      "common.loading": "Loading...",
      "auth.signIn": "Sign In",
      "auth.google": "Sign in with Google",
      "profile.edit": "Edit Profile",
      "profile.save": "Save Changes",
      "profile.cancel": "Cancel",
      "profile.displayName": "Display Name",
      "profile.bio": "Bio",
      "profile.language": "App Language",
      "profile.tracks": "Tracks",
      "profile.playlists": "Playlists",
      "profile.following": "Following",
      "explore.trending": "Trending Now",
      "explore.genres": "Browse by Genre"
    }
  },
  es: {
    translation: {
      "nav.home": "Inicio",
      "nav.explore": "Explorar",
      "nav.upload": "Subir",
      "nav.profile": "Perfil",
      "nav.login": "Iniciar Sesión",
      "nav.logout": "Cerrar Sesión",
      "home.welcome": "Bienvenido a U-Fi",
      "home.feed": "Tu Feed",
      "upload.title": "Subir Nueva Pista",
      "upload.dragDrop": "Arrastra o haz clic para seleccionar",
      "upload.audio": "Archivo de Audio",
      "upload.cover": "Imagen de Portada",
      "upload.submit": "Publicar Pista",
      "common.loading": "Cargando...",
      "auth.signIn": "Iniciar Sesión",
      "auth.google": "Entrar con Google",
      "profile.edit": "Editar Perfil",
      "profile.save": "Guardar Cambios",
      "profile.cancel": "Cancelar",
      "profile.displayName": "Nombre",
      "profile.bio": "Biografía",
      "profile.language": "Idioma de la App",
      "profile.tracks": "Pistas",
      "profile.playlists": "Listas",
      "profile.following": "Siguiendo",
      "explore.trending": "Tendencias",
      "explore.genres": "Explorar por Género"
    }
  },
  pt: {
    translation: {
      "nav.home": "Início",
      "nav.explore": "Explorar",
      "nav.upload": "Enviar",
      "nav.profile": "Perfil",
      "nav.login": "Entrar",
      "nav.logout": "Sair",
      "home.welcome": "Bem-vindo ao U-Fi",
      "home.feed": "Seu Feed",
      "upload.title": "Enviar Nova Faixa",
      "upload.dragDrop": "Arraste ou clique para selecionar",
      "upload.audio": "Arquivo de Áudio",
      "upload.cover": "Imagem de Capa",
      "upload.submit": "Publicar Faixa",
      "common.loading": "Carregando...",
      "auth.signIn": "Entrar",
      "auth.google": "Entrar com Google",
      "profile.edit": "Editar Perfil",
      "profile.save": "Salvar Alterações",
      "profile.cancel": "Cancelar",
      "profile.displayName": "Nome de Exibição",
      "profile.bio": "Biografia",
      "profile.language": "Idioma do App",
      "profile.tracks": "Faixas",
      "profile.playlists": "Playlists",
      "profile.following": "Seguindo",
      "explore.trending": "Em Alta",
      "explore.genres": "Navegar por Gênero"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;