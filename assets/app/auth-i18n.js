/* Neuropian members app: the sign-up / log-in pop-up, the terms step and the set-password box in French, Spanish,
   Hebrew, Hindi and Chinese (2026-10-25). Same wording choices as the translated home pages
   (~/neuropian-tools/runs/i18n-2026-10-24/NOTES.md): fr = vous, es = tú, he = plural, Neuropian feminine, hi = आप,
   zh = 你; names (Neuropian, RoundTable, GitHub, Talent) stay in Latin script; Terms and Privacy stay English and say so.

   app.html loads this file only when a language was picked (?lang=xx, the framing page's <html lang>, or a GitHub
   sign-in started from a translated page), so English never loads it and never changes.
   How it works: every visible English string inside #auth-gate, #terms-gate and #set-password-modal is looked up by its
   exact English text (whitespace collapsed). A sentence with links or emphasis inside is one entry, with its inline
   tags written bare (<a>..</a>, <em>..</em>); the originals' attributes (onclick, href, style) go back on in order.
   A MutationObserver re-applies the table whenever the app writes new text (errors, button states, the username
   check), so app.html's own code keeps writing English and needs no changes. Strings with no entry stay English and
   are listed in window.__npI18nMiss (for testing). Bump ?v= in app.html when this file changes (Safari caches hard). */
(function () {
  'use strict';
  var L = window.__npLang;
  var NB = ' ', WJ = '⁠';

  /* Supabase's own messages that carry a number or a value; replacements per language below, same order. */
  var RX = [
    /^Password should be at least (\d+) characters\.?$/,
    /^For security purposes, you can only request this after (\d+) seconds?\.?$/,
    /^For security purposes, you can only request this once every (\d+) seconds?\.?$/,
    /^Email address "[^"]*" is invalid\.?$/,
    /^Password should contain at least one character of each: (.*)$/,
    /^Could not save that: (.*)$/            // terms step; the reason after it is translated too
  ];
  var NESTED = { 5: 1 };

  var M_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var COLORS_EN = ['Black', 'Blue', 'Teal', 'Purple', 'Coral', 'Gold', 'Pink', 'Turquoise', 'Forest', 'Indigo', 'Terracotta', 'Amethyst', 'Mustard', 'Peacock', 'Crimson', 'Slate'];

  var DICT = {
    fr: {
      months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
      colors: ['Noir', 'Bleu', 'Bleu canard', 'Violet', 'Corail', 'Or', 'Rose', 'Turquoise', 'Vert forêt', 'Indigo', 'Terre cuite', 'Améthyste', 'Moutarde', 'Bleu paon', 'Cramoisi', 'Ardoise'],
      rx: [
        'Le mot de passe doit comporter au moins $1 caractères.',
        'Par sécurité, vous pourrez refaire cette demande dans $1 secondes.',
        'Par sécurité, cette demande n’est possible qu’une fois toutes les $1 secondes.',
        'Cette adresse e-mail n’est pas valide.',
        'Le mot de passe doit contenir au moins un caractère de chacun de ces groupes' + NB + ': $1',
        'Impossible d’enregistrer' + NB + ': $1'
      ],
      t: {
        // log in
        'Close': 'Fermer',
        'Sign <em>In</em>': 'Se <em>connecter</em>',
        'Access your profile and opportunities': 'Accédez à votre profil et à vos opportunités',
        'By continuing you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a> and confirm you are 18 or older. Neuropian reads your public work there to build your profile.':
          'En continuant, vous acceptez les <a>conditions d’utilisation</a> et la <a>politique de confidentialité</a> (en anglais) et confirmez avoir 18 ans ou plus. Neuropian y consulte vos travaux publics pour construire votre profil.',
        'or with email': 'ou par e-mail',
        'Continue with GitHub': 'Continuer avec GitHub',
        "Sign in to view <em>Talent</em>": "Connectez-vous pour voir <em>Talent</em>",
        "Search builders by the work they've shipped. Free while we're early.": "Cherchez des bâtisseurs d’après le travail qu’ils ont livré. Gratuit pendant nos débuts.",
        "Discover <em>opportunities</em>": "Découvrez des <em>opportunités</em>",
        "For builders search engines miss. Sign in with GitHub and see your draft profile in seconds, made from the pull requests you've had merged. Free. Nothing goes public until you publish, and it never shows your email or location.": "Pour les bâtisseurs que les moteurs de recherche ne voient pas. Connectez-vous avec GitHub et voyez votre brouillon de profil en quelques secondes, fait à partir des pull requests qui ont été fusionnées. Gratuit. Rien n’est public tant que vous ne publiez pas, et il n’affiche jamais votre e-mail ni votre localisation.",
        "or": "ou",
        "Sign up with email": "S’inscrire par e-mail",
        "Continue with Google": "Continuer avec Google",
        'Continue with GitLab': 'Continuer avec GitLab',
        'Continue with Figma': 'Continuer avec Figma',
        'Continue with LinkedIn': 'Continuer avec LinkedIn',
        'Email Address': 'Adresse e-mail',
        'you@example.com': 'vous@exemple.com',
        'Password': 'Mot de passe',
        'Your password': 'Votre mot de passe',
        'Sign In & Continue': 'Se connecter et continuer',
        'Signing in…': 'Connexion…',
        'Forgot password?': 'Mot de passe oublié' + NB + '?',
        'Don\'t have an account? <a>Create one, it\'s free</a>': 'Pas encore de compte' + NB + '? <a>Créez-en un gratuitement</a>',
        // reset password
        'Reset <em>Password</em>': 'Réinitialiser le <em>mot de passe</em>',
        'Enter your email and we\'ll send a reset link': 'Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation',
        'Reset link sent, check your inbox.': 'Lien envoyé, consultez votre boîte de réception.',
        'Send Reset Link': 'Envoyer le lien',
        'Sending…': 'Envoi…',
        '← Back to Sign In': '← Retour à la connexion',
        'Please enter your email address.': 'Veuillez saisir votre adresse e-mail.',
        // create an account
        'Join <em>neuropian</em>': 'Rejoignez <em>neuropian</em>',
        'Show what you\'ve built, find opportunities and join RoundTable': 'Montrez ce que vous avez construit, trouvez des opportunités et rejoignez RoundTable',
        'Already have an account? <a>Sign in</a>': 'Déjà un compte' + NB + '? <a>Connectez-vous</a>',
        'Username': 'Nom d’utilisateur',
        'yourhandle': 'votre_pseudo',
        'Your public name in chat. Letters, numbers, underscores. More than 3 characters.': 'Votre nom public dans le chat. Lettres sans accents, chiffres et tirets bas. Plus de 3 caractères.',
        'Must be more than 3 characters.': 'Doit comporter plus de 3 caractères.',
        'Letters, numbers, and underscores only.': 'Lettres sans accents, chiffres et tirets bas uniquement.',
        'Checking…': 'Vérification…',
        'Username taken.': 'Nom d’utilisateur déjà pris.',
        'Available!': 'Disponible' + NB + '!',
        'First Name': 'Prénom',
        'Given name': 'Votre prénom',
        'Last Name': 'Nom',
        'Family name': 'Votre nom de famille',
        'Date of Birth': 'Date de naissance',
        'Month': 'Mois', 'Day': 'Jour', 'Year': 'Année',
        'Create a strong password': 'Choisissez un mot de passe robuste',
        'At least 6 characters.': 'Au moins 6 caractères.',
        'Profile Picture <span>- required</span>': 'Photo de profil <span>(obligatoire)</span>',
        'Brain Avatar': 'Avatar cerveau',
        'Upload Photo': 'Importer une photo',
        'Choose a logo variation': 'Choisissez une variante du logo',
        'Choose file': 'Choisir un fichier',
        'Neuropian may share your profile with companies and funds that hire through us. By creating an account you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. You must be 18 or older.':
          'Neuropian peut partager votre profil avec les entreprises et les fonds qui recrutent par notre intermédiaire. En créant un compte, vous acceptez les <a>conditions d’utilisation</a> et la <a>politique de confidentialité</a> (en anglais). Vous devez avoir 18 ans ou plus.',
        'Create Account & Continue': 'Créer le compte et continuer',
        'Creating account…': 'Création du compte…',
        '← Back': '← Retour',
        'Terms of Service': 'Conditions d’utilisation (en anglais)',
        'Privacy Policy': 'Politique de confidentialité (en anglais)',
        // checks made by the page
        'Service unavailable. Please try again later.': 'Service indisponible. Veuillez réessayer plus tard.',
        'Please fill in all fields.': 'Veuillez remplir tous les champs.',
        'Please enter a valid email address.': 'Veuillez saisir une adresse e-mail valide.',
        'Please choose a profile picture or select a brain avatar.': 'Veuillez choisir une photo de profil ou sélectionner un avatar cerveau.',
        'Username must be more than 3 characters.': 'Le nom d’utilisateur doit comporter plus de 3 caractères.',
        'Username can only contain letters, numbers, and underscores.': 'Le nom d’utilisateur ne peut contenir que des lettres sans accents, des chiffres et des tirets bas.',
        'Please enter your real date of birth.': 'Veuillez indiquer votre vraie date de naissance.',
        'You must be 18 or older to create an account.': 'Vous devez avoir 18 ans ou plus pour créer un compte.',
        'Password must be at least 6 characters.': 'Le mot de passe doit comporter au moins 6 caractères.',
        'That username is already taken. Please choose another.': 'Ce nom d’utilisateur est déjà pris. Veuillez en choisir un autre.',
        'This email already has an account. Sign in with your password, or use Forgot password.': 'Un compte existe déjà avec cet e-mail. Connectez-vous avec votre mot de passe ou utilisez «' + NB + 'Mot de passe oublié' + NB + '?' + NB + '».',
        // set a new password (after the reset e-mail)
        'Set New Password': 'Définir un nouveau mot de passe',
        'Enter and confirm your new password.': 'Saisissez votre nouveau mot de passe, puis confirmez-le.',
        'New Password': 'Nouveau mot de passe',
        'New password': 'Nouveau mot de passe',
        'Confirm Password': 'Confirmer le mot de passe',
        'Confirm new password': 'Confirmez le nouveau mot de passe',
        'Update Password': 'Mettre à jour le mot de passe',
        'Updating…': 'Mise à jour…',
        'Please fill in both fields.': 'Veuillez remplir les deux champs.',
        'Passwords do not match.': 'Les mots de passe ne correspondent pas.',
        // terms step
        'Updated terms · 18 October 2026': 'Conditions mises à jour · 18' + NB + 'octobre' + NB + '2026',
        'Before you continue: Neuropian may share member profiles with companies and funds that hire through us. Nothing from your account is shared unless you accept. Read the <a>Terms</a> and <a>Privacy Policy</a>.':
          'Avant de continuer' + NB + ': Neuropian peut partager les profils des membres avec les entreprises et les fonds qui recrutent par notre intermédiaire. Rien de votre compte n’est partagé sans votre accord. Lisez les <a>conditions d’utilisation</a> et la <a>politique de confidentialité</a> (en anglais).',
        'I am 18 or older': 'J’ai 18 ans ou plus',
        'Accept and continue': 'Accepter et continuer',
        'Not now (sign out)': 'Pas maintenant (se déconnecter)',
        'Neuropian is now for adults (18+), so this account is paused. Nothing from it is shared. To download or delete your data, email <a>dylan@neuropian.com</a>.':
          'Neuropian est désormais réservé aux adultes (18 ans et plus)' + NB + ': ce compte est donc suspendu. Rien n’en est partagé. Pour télécharger ou supprimer vos données, écrivez à <a>dylan@neuropian.com</a>.',
        // Supabase's own messages
        'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
        'Email not confirmed': 'Votre adresse e-mail n’est pas encore confirmée' + NB + ': ouvrez le lien que nous vous avons envoyé.',
        'User already registered': 'Un compte existe déjà avec cet e-mail.',
        'Unable to validate email address: invalid format': 'Cette adresse e-mail n’est pas valide.',
        'Password is known to be weak and easy to guess, please choose a different one.': 'Ce mot de passe est trop courant et facile à deviner. Veuillez en choisir un autre.',
        'Email rate limit exceeded': 'Trop d’e-mails envoyés. Réessayez dans quelques minutes.',
        'Request rate limit reached': 'Trop de tentatives. Réessayez dans quelques minutes.',
        'Too many requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
        'Signups not allowed for this instance': 'Les inscriptions sont fermées pour le moment.',
        'Database error saving new user': 'Le compte n’a pas pu être créé. Réessayez plus tard.',
        'Neuropian is for adults (18+)': 'Neuropian est réservé aux adultes (18 ans et plus).',
        'Failed to fetch': 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
        'Load failed': 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
        'NetworkError when attempting to fetch resource.': 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
        'New password should be different from the old password.': 'Le nouveau mot de passe doit être différent de l’ancien.',
        'Auth session missing!': 'Votre session a expiré. Reconnectez-vous.',
        'Error sending recovery email': 'L’e-mail n’a pas pu être envoyé. Réessayez plus tard.',
        'Error sending confirmation email': 'L’e-mail n’a pas pu être envoyé. Réessayez plus tard.'
      }
    },

    es: {
      months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      colors: ['Negro', 'Azul', 'Verde azulado', 'Morado', 'Coral', 'Dorado', 'Rosa', 'Turquesa', 'Verde bosque', 'Índigo', 'Terracota', 'Amatista', 'Mostaza', 'Azul pavo real', 'Carmesí', 'Pizarra'],
      rx: [
        'La contraseña debe tener al menos $1 caracteres.',
        'Por seguridad, podrás volver a pedirlo dentro de $1 segundos.',
        'Por seguridad, solo puedes pedirlo una vez cada $1 segundos.',
        'Este correo electrónico no es válido.',
        'La contraseña debe tener al menos un carácter de cada uno de estos grupos: $1',
        'No se pudo guardar: $1'
      ],
      t: {
        'Close': 'Cerrar',
        'Sign <em>In</em>': 'Iniciar <em>sesión</em>',
        'Access your profile and opportunities': 'Accede a tu perfil y a tus oportunidades',
        'By continuing you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a> and confirm you are 18 or older. Neuropian reads your public work there to build your profile.':
          'Al continuar, aceptas los <a>Términos del servicio</a> y la <a>Política de privacidad</a> (en inglés) y confirmas que tienes 18 años o más. Neuropian lee allí tu trabajo público para construir tu perfil.',
        'or with email': 'o con correo electrónico',
        'Continue with GitHub': 'Continuar con GitHub',
        "Sign in to view <em>Talent</em>": "Inicia sesión para ver <em>Talent</em>",
        "Search builders by the work they've shipped. Free while we're early.": "Busca a quienes construyen por el trabajo que han entregado. Gratis mientras empezamos.",
        "Discover <em>opportunities</em>": "Descubre <em>oportunidades</em>",
        "For builders search engines miss. Sign in with GitHub and see your draft profile in seconds, made from the pull requests you've had merged. Free. Nothing goes public until you publish, and it never shows your email or location.": "Para quienes construyen y los buscadores no ven. Inicia sesión con GitHub y ve tu borrador de perfil en segundos, hecho con las pull requests que te han fusionado. Gratis. Nada se hace público hasta que publicas, y nunca muestra tu correo ni tu ubicación.",
        "or": "o",
        "Sign up with email": "Regístrate con correo electrónico",
        "Continue with Google": "Continuar con Google",
        'Continue with GitLab': 'Continuar con GitLab',
        'Continue with Figma': 'Continuar con Figma',
        'Continue with LinkedIn': 'Continuar con LinkedIn',
        'Email Address': 'Correo electrónico',
        'you@example.com': 'tu@ejemplo.com',
        'Password': 'Contraseña',
        'Your password': 'Tu contraseña',
        'Sign In & Continue': 'Iniciar sesión y continuar',
        'Signing in…': 'Iniciando sesión…',
        'Forgot password?': '¿Olvidaste tu contraseña?',
        'Don\'t have an account? <a>Create one, it\'s free</a>': '¿No tienes cuenta? <a>Crea una, es gratis</a>',
        'Reset <em>Password</em>': 'Restablecer <em>contraseña</em>',
        'Enter your email and we\'ll send a reset link': 'Escribe tu correo y te enviaremos un enlace para restablecerla',
        'Reset link sent, check your inbox.': 'Enlace enviado, revisa tu bandeja de entrada.',
        'Send Reset Link': 'Enviar enlace',
        'Sending…': 'Enviando…',
        '← Back to Sign In': '← Volver a iniciar sesión',
        'Please enter your email address.': 'Escribe tu correo electrónico.',
        'Join <em>neuropian</em>': 'Únete a <em>neuropian</em>',
        'Show what you\'ve built, find opportunities and join RoundTable': 'Muestra lo que has construido, encuentra oportunidades y únete a RoundTable',
        'Already have an account? <a>Sign in</a>': '¿Ya tienes cuenta? <a>Inicia sesión</a>',
        'Username': 'Nombre de usuario',
        'yourhandle': 'tu_usuario',
        'Your public name in chat. Letters, numbers, underscores. More than 3 characters.': 'Tu nombre público en el chat. Letras sin tildes ni ñ, números y guiones bajos. Más de 3 caracteres.',
        'Must be more than 3 characters.': 'Debe tener más de 3 caracteres.',
        'Letters, numbers, and underscores only.': 'Solo letras sin tildes ni ñ, números y guiones bajos.',
        'Checking…': 'Comprobando…',
        'Username taken.': 'Nombre de usuario en uso.',
        'Available!': '¡Disponible!',
        'First Name': 'Nombre',
        'Given name': 'Tu nombre',
        'Last Name': 'Apellidos',
        'Family name': 'Tus apellidos',
        'Date of Birth': 'Fecha de nacimiento',
        'Month': 'Mes', 'Day': 'Día', 'Year': 'Año',
        'Create a strong password': 'Crea una contraseña segura',
        'At least 6 characters.': 'Al menos 6 caracteres.',
        'Profile Picture <span>- required</span>': 'Foto de perfil <span>(obligatoria)</span>',
        'Brain Avatar': 'Avatar de cerebro',
        'Upload Photo': 'Subir foto',
        'Choose a logo variation': 'Elige una variante del logotipo',
        'Choose file': 'Elegir archivo',
        'Neuropian may share your profile with companies and funds that hire through us. By creating an account you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. You must be 18 or older.':
          'Neuropian puede compartir tu perfil con empresas y fondos que contratan a través de nosotros. Al crear una cuenta, aceptas los <a>Términos del servicio</a> y la <a>Política de privacidad</a> (en inglés). Debes tener 18 años o más.',
        'Create Account & Continue': 'Crear cuenta y continuar',
        'Creating account…': 'Creando la cuenta…',
        '← Back': '← Volver',
        'Terms of Service': 'Términos del servicio (en inglés)',
        'Privacy Policy': 'Política de privacidad (en inglés)',
        'Service unavailable. Please try again later.': 'Servicio no disponible. Inténtalo de nuevo más tarde.',
        'Please fill in all fields.': 'Completa todos los campos.',
        'Please enter a valid email address.': 'Escribe un correo electrónico válido.',
        'Please choose a profile picture or select a brain avatar.': 'Elige una foto de perfil o selecciona un avatar de cerebro.',
        'Username must be more than 3 characters.': 'El nombre de usuario debe tener más de 3 caracteres.',
        'Username can only contain letters, numbers, and underscores.': 'El nombre de usuario solo puede tener letras sin tildes ni ñ, números y guiones bajos.',
        'Please enter your real date of birth.': 'Indica tu fecha de nacimiento real.',
        'You must be 18 or older to create an account.': 'Debes tener 18 años o más para crear una cuenta.',
        'Password must be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
        'That username is already taken. Please choose another.': 'Ese nombre de usuario ya está en uso. Elige otro.',
        'This email already has an account. Sign in with your password, or use Forgot password.': 'Este correo ya tiene una cuenta. Inicia sesión con tu contraseña o usa «¿Olvidaste tu contraseña?».',
        'Set New Password': 'Establecer nueva contraseña',
        'Enter and confirm your new password.': 'Escribe tu nueva contraseña y confírmala.',
        'New Password': 'Nueva contraseña',
        'New password': 'Nueva contraseña',
        'Confirm Password': 'Confirmar contraseña',
        'Confirm new password': 'Confirma la nueva contraseña',
        'Update Password': 'Actualizar contraseña',
        'Updating…': 'Actualizando…',
        'Please fill in both fields.': 'Completa los dos campos.',
        'Passwords do not match.': 'Las contraseñas no coinciden.',
        'Updated terms · 18 October 2026': 'Términos actualizados · 18' + NB + 'de' + NB + 'octubre' + NB + 'de' + NB + '2026',
        'Before you continue: Neuropian may share member profiles with companies and funds that hire through us. Nothing from your account is shared unless you accept. Read the <a>Terms</a> and <a>Privacy Policy</a>.':
          'Antes de continuar: Neuropian puede compartir los perfiles de los miembros con empresas y fondos que contratan a través de nosotros. No se comparte nada de tu cuenta a menos que aceptes. Lee los <a>Términos</a> y la <a>Política de privacidad</a> (en inglés).',
        'I am 18 or older': 'Tengo 18 años o más',
        'Accept and continue': 'Aceptar y continuar',
        'Not now (sign out)': 'Ahora no (cerrar sesión)',
        'Neuropian is now for adults (18+), so this account is paused. Nothing from it is shared. To download or delete your data, email <a>dylan@neuropian.com</a>.':
          'Neuropian ahora es solo para adultos (18+), así que esta cuenta está en pausa. No se comparte nada de ella. Para descargar o eliminar tus datos, escribe a <a>dylan@neuropian.com</a>.',
        'Invalid login credentials': 'Correo o contraseña incorrectos.',
        'Email not confirmed': 'Tu correo aún no está confirmado: abre el enlace que te enviamos.',
        'User already registered': 'Ya existe una cuenta con este correo.',
        'Unable to validate email address: invalid format': 'Este correo electrónico no es válido.',
        'Password is known to be weak and easy to guess, please choose a different one.': 'Esta contraseña es muy común y fácil de adivinar. Elige otra.',
        'Email rate limit exceeded': 'Se enviaron demasiados correos. Inténtalo de nuevo en unos minutos.',
        'Request rate limit reached': 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
        'Too many requests': 'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
        'Signups not allowed for this instance': 'El registro está cerrado por ahora.',
        'Database error saving new user': 'No se pudo crear la cuenta. Inténtalo de nuevo más tarde.',
        'Neuropian is for adults (18+)': 'Neuropian es solo para mayores de 18 años.',
        'Failed to fetch': 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
        'Load failed': 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
        'NetworkError when attempting to fetch resource.': 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
        'New password should be different from the old password.': 'La nueva contraseña debe ser distinta de la anterior.',
        'Auth session missing!': 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
        'Error sending recovery email': 'No se pudo enviar el correo. Inténtalo de nuevo más tarde.',
        'Error sending confirmation email': 'No se pudo enviar el correo. Inténtalo de nuevo más tarde.'
      }
    },

    he: {
      months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
      colors: ['שחור', 'כחול', 'כחול-ירקרק', 'סגול', 'אלמוג', 'זהב', 'ורוד', 'טורקיז', 'ירוק יער', 'אינדיגו', 'טרקוטה', 'אמטיסט', 'חרדל', 'כחול טווס', 'ארגמן', 'אפור צפחה'],
      rx: [
        'הסיסמה חייבת להכיל לפחות $1 תווים.',
        'מטעמי אבטחה, אפשר לבקש שוב בעוד $1 שניות.',
        'מטעמי אבטחה, אפשר לבקש זאת רק פעם אחת בכל $1 שניות.',
        'כתובת האימייל אינה תקינה.',
        'הסיסמה חייבת להכיל לפחות תו אחד מכל אחת מהקבוצות האלה: $1',
        'לא ניתן היה לשמור: $1'
      ],
      t: {
        'Close': 'סגירה',
        'Sign <em>In</em>': 'התחברות <em>לחשבון</em>',
        'Access your profile and opportunities': 'גישה לפרופיל ולהזדמנויות שלכם',
        'By continuing you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a> and confirm you are 18 or older. Neuropian reads your public work there to build your profile.':
          'אם תמשיכו, אתם מסכימים ל<a>תנאי השימוש</a> ול<a>מדיניות הפרטיות</a> (באנגלית) ומאשרים שאתם בני 18 ומעלה. Neuropian קוראת שם את העבודות הציבוריות שלכם כדי לבנות את הפרופיל שלכם.',
        'or with email': 'או עם אימייל',
        'Continue with GitHub': 'המשך עם GitHub',
        "Sign in to view <em>Talent</em>": "התחברו כדי לראות את <em>Talent</em>",
        "Search builders by the work they've shipped. Free while we're early.": "חפשו בונים לפי העבודה שהם מסרו. בחינם בזמן שאנחנו בתחילת הדרך.",
        "Discover <em>opportunities</em>": "גלו <em>הזדמנויות</em>",
        "For builders search engines miss. Sign in with GitHub and see your draft profile in seconds, made from the pull requests you've had merged. Free. Nothing goes public until you publish, and it never shows your email or location.": "לבונים שמנועי החיפוש מפספסים. התחברו עם GitHub וראו טיוטת פרופיל תוך שניות, מבקשות המיזוג שמוזגו. בחינם. שום דבר לא הופך לציבורי עד שאתם מפרסמים, והוא אף פעם לא מציג את האימייל או המיקום שלכם.",
        "or": "או",
        "Sign up with email": "הרשמה עם אימייל",
        "Continue with Google": "המשך עם Google",
        'Continue with GitLab': 'המשך עם GitLab',
        'Continue with Figma': 'המשך עם Figma',
        'Continue with LinkedIn': 'המשך עם LinkedIn',
        'Email Address': 'כתובת אימייל',
        'you@example.com': 'you@example.com',
        'Password': 'סיסמה',
        'Your password': 'הסיסמה שלכם',
        'Sign In & Continue': 'התחברות והמשך',
        'Signing in…': 'מתבצעת התחברות…',
        'Forgot password?': 'שכחתם את הסיסמה?',
        'Don\'t have an account? <a>Create one, it\'s free</a>': 'אין לכם חשבון? <a>צרו חשבון בחינם</a>',
        'Reset <em>Password</em>': 'איפוס <em>סיסמה</em>',
        'Enter your email and we\'ll send a reset link': 'הזינו את כתובת האימייל שלכם ונשלח אליכם קישור לאיפוס',
        'Reset link sent, check your inbox.': 'הקישור לאיפוס נשלח, בדקו את תיבת הדואר הנכנס.',
        'Send Reset Link': 'שליחת קישור לאיפוס',
        'Sending…': 'שולחים…',
        '← Back to Sign In': '→ חזרה להתחברות',
        'Please enter your email address.': 'נא להזין את כתובת האימייל שלכם.',
        'Join <em>neuropian</em>': 'הצטרפו ל-' + WJ + '<em>neuropian</em>',
        'Show what you\'ve built, find opportunities and join RoundTable': 'הראו מה בניתם, מצאו הזדמנויות והצטרפו ל-' + WJ + 'RoundTable',
        'Already have an account? <a>Sign in</a>': 'כבר יש לכם חשבון? <a>התחברו</a>',
        'Username': 'שם משתמש',
        'yourhandle': 'yourhandle',
        'Your public name in chat. Letters, numbers, underscores. More than 3 characters.': 'השם הציבורי שלכם בצ׳אט. אותיות באנגלית, ספרות וקו תחתון. יותר מ-' + WJ + '3 תווים.',
        'Must be more than 3 characters.': 'חייב להכיל יותר מ-' + WJ + '3 תווים.',
        'Letters, numbers, and underscores only.': 'רק אותיות באנגלית, ספרות וקו תחתון.',
        'Checking…': 'בודקים…',
        'Username taken.': 'שם המשתמש תפוס.',
        'Available!': 'פנוי!',
        'First Name': 'שם פרטי',
        'Given name': 'השם הפרטי שלכם',
        'Last Name': 'שם משפחה',
        'Family name': 'שם המשפחה שלכם',
        'Date of Birth': 'תאריך לידה',
        'Month': 'חודש', 'Day': 'יום', 'Year': 'שנה',
        'Create a strong password': 'בחרו סיסמה חזקה',
        'At least 6 characters.': 'לפחות 6 תווים.',
        'Profile Picture <span>- required</span>': 'תמונת פרופיל <span>(חובה)</span>',
        'Brain Avatar': 'אווטאר מוח',
        'Upload Photo': 'העלאת תמונה',
        'Choose a logo variation': 'בחרו גרסה של הלוגו',
        'Choose file': 'בחירת קובץ',
        'Neuropian may share your profile with companies and funds that hire through us. By creating an account you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. You must be 18 or older.':
          'Neuropian עשויה לשתף את הפרופיל שלכם עם חברות וקרנות שמגייסות דרכנו. ביצירת חשבון אתם מסכימים ל<a>תנאי השימוש</a> ול<a>מדיניות הפרטיות</a> (באנגלית). עליכם להיות בני 18 ומעלה.',
        'Create Account & Continue': 'יצירת חשבון והמשך',
        'Creating account…': 'יוצרים את החשבון…',
        '← Back': '→ חזרה',
        'Terms of Service': 'תנאי השימוש (באנגלית)',
        'Privacy Policy': 'מדיניות הפרטיות (באנגלית)',
        'Service unavailable. Please try again later.': 'השירות אינו זמין. נסו שוב מאוחר יותר.',
        'Please fill in all fields.': 'נא למלא את כל השדות.',
        'Please enter a valid email address.': 'נא להזין כתובת אימייל תקינה.',
        'Please choose a profile picture or select a brain avatar.': 'נא לבחור תמונת פרופיל או אווטאר מוח.',
        'Username must be more than 3 characters.': 'שם המשתמש חייב להכיל יותר מ-' + WJ + '3 תווים.',
        'Username can only contain letters, numbers, and underscores.': 'שם המשתמש יכול להכיל רק אותיות באנגלית, ספרות וקו תחתון.',
        'Please enter your real date of birth.': 'נא להזין את תאריך הלידה האמיתי שלכם.',
        'You must be 18 or older to create an account.': 'כדי ליצור חשבון עליכם להיות בני 18 ומעלה.',
        'Password must be at least 6 characters.': 'הסיסמה חייבת להכיל לפחות 6 תווים.',
        'That username is already taken. Please choose another.': 'שם המשתמש הזה כבר תפוס. נא לבחור שם אחר.',
        'This email already has an account. Sign in with your password, or use Forgot password.': 'לכתובת האימייל הזו כבר יש חשבון. התחברו עם הסיסמה שלכם, או לחצו על "שכחתם את הסיסמה?".',
        'Set New Password': 'הגדרת סיסמה חדשה',
        'Enter and confirm your new password.': 'הזינו סיסמה חדשה ואשרו אותה.',
        'New Password': 'סיסמה חדשה',
        'New password': 'סיסמה חדשה',
        'Confirm Password': 'אימות סיסמה',
        'Confirm new password': 'הזינו שוב את הסיסמה החדשה',
        'Update Password': 'עדכון סיסמה',
        'Updating…': 'מעדכנים…',
        'Please fill in both fields.': 'נא למלא את שני השדות.',
        'Passwords do not match.': 'הסיסמאות אינן תואמות.',
        'Updated terms · 18 October 2026': 'תנאים מעודכנים · 18' + NB + 'באוקטובר' + NB + '2026',
        'Before you continue: Neuropian may share member profiles with companies and funds that hire through us. Nothing from your account is shared unless you accept. Read the <a>Terms</a> and <a>Privacy Policy</a>.':
          'לפני שממשיכים: Neuropian עשויה לשתף פרופילים של חברים עם חברות וקרנות שמגייסות דרכנו. שום דבר מהחשבון שלכם לא ישותף אם לא תאשרו. קראו את <a>תנאי השימוש</a> ואת <a>מדיניות הפרטיות</a> (באנגלית).',
        'I am 18 or older': 'מלאו לי 18',
        'Accept and continue': 'אישור והמשך',
        'Not now (sign out)': 'לא עכשיו (התנתקות)',
        'Neuropian is now for adults (18+), so this account is paused. Nothing from it is shared. To download or delete your data, email <a>dylan@neuropian.com</a>.':
          'Neuropian מיועדת עכשיו לבני 18 ומעלה בלבד, ולכן החשבון הזה מושהה. שום דבר ממנו לא משותף. כדי להוריד או למחוק את הנתונים שלכם, כתבו ל-' + WJ + '<a>dylan@neuropian.com</a>.',
        'Invalid login credentials': 'האימייל או הסיסמה שגויים.',
        'Email not confirmed': 'כתובת האימייל עדיין לא אומתה: פתחו את הקישור ששלחנו אליכם.',
        'User already registered': 'כבר קיים חשבון עם כתובת האימייל הזו.',
        'Unable to validate email address: invalid format': 'כתובת האימייל אינה תקינה.',
        'Password is known to be weak and easy to guess, please choose a different one.': 'הסיסמה הזו נפוצה וקל לנחש אותה. נא לבחור סיסמה אחרת.',
        'Email rate limit exceeded': 'נשלחו יותר מדי הודעות אימייל. נסו שוב בעוד כמה דקות.',
        'Request rate limit reached': 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.',
        'Too many requests': 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.',
        'Signups not allowed for this instance': 'ההרשמה סגורה כרגע.',
        'Database error saving new user': 'לא ניתן היה ליצור את החשבון. נסו שוב מאוחר יותר.',
        'Neuropian is for adults (18+)': 'Neuropian מיועדת לבני 18 ומעלה בלבד.',
        'Failed to fetch': 'אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.',
        'Load failed': 'אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.',
        'NetworkError when attempting to fetch resource.': 'אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.',
        'New password should be different from the old password.': 'הסיסמה החדשה חייבת להיות שונה מהקודמת.',
        'Auth session missing!': 'פג תוקף ההתחברות. התחברו מחדש.',
        'Error sending recovery email': 'לא ניתן היה לשלוח את האימייל. נסו שוב מאוחר יותר.',
        'Error sending confirmation email': 'לא ניתן היה לשלוח את האימייל. נסו שוב מאוחר יותר.'
      }
    },

    hi: {
      months: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
      colors: ['काला', 'नीला', 'हरा-नीला', 'बैंगनी', 'मूँगा', 'सुनहरा', 'गुलाबी', 'फ़िरोज़ी', 'गहरा हरा', 'नील', 'टेराकोटा', 'जामुनी', 'सरसों', 'मोरपंखी', 'किरमिज़ी', 'स्लेटी'],
      rx: [
        'पासवर्ड कम से कम $1 वर्णों का होना चाहिए।',
        'सुरक्षा कारणों से आप यह अनुरोध $1 सेकंड बाद फिर कर सकते हैं।',
        'सुरक्षा कारणों से यह अनुरोध हर $1 सेकंड में सिर्फ़ एक बार किया जा सकता है।',
        'यह ईमेल पता मान्य नहीं है।',
        'पासवर्ड में इनमें से हर समूह का कम से कम एक वर्ण होना चाहिए: $1',
        'सहेजा नहीं जा सका: $1'
      ],
      t: {
        'Close': 'बंद करें',
        'Sign <em>In</em>': 'साइन <em>इन</em>',
        'Access your profile and opportunities': 'अपनी प्रोफ़ाइल और अवसरों तक पहुँचें',
        'By continuing you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a> and confirm you are 18 or older. Neuropian reads your public work there to build your profile.':
          'जारी रखकर आप <a>सेवा की शर्तों</a> और <a>गोपनीयता नीति</a> (अंग्रेज़ी में) से सहमत होते हैं और पुष्टि करते हैं कि आपकी उम्र 18 वर्ष या उससे अधिक है। Neuropian आपकी प्रोफ़ाइल बनाने के लिए वहाँ आपका सार्वजनिक काम पढ़ता है।',
        'or with email': 'या ईमेल से',
        'Continue with GitHub': 'GitHub से जारी रखें',
        "Sign in to view <em>Talent</em>": "<em>Talent</em> देखने के लिए साइन इन करें",
        "Search builders by the work they've shipped. Free while we're early.": "बिल्डर्स को उनके किए गए काम से खोजें। हमारी शुरुआत तक मुफ़्त।",
        "Discover <em>opportunities</em>": "<em>अवसर</em> खोजें",
        "For builders search engines miss. Sign in with GitHub and see your draft profile in seconds, made from the pull requests you've had merged. Free. Nothing goes public until you publish, and it never shows your email or location.": "उन बिल्डर्स के लिए जिन्हें सर्च इंजन नहीं देख पाते। GitHub से साइन इन करें और कुछ ही सेकंड में अपनी प्रोफ़ाइल का ड्राफ़्ट देखें, जो आपके मर्ज हुए पुल रिक्वेस्ट से बना है। मुफ़्त। जब तक आप प्रकाशित न करें, कुछ भी सार्वजनिक नहीं होता, और यह कभी आपका ईमेल या लोकेशन नहीं दिखाती।",
        "or": "या",
        "Sign up with email": "ईमेल से साइन अप करें",
        "Continue with Google": "Google से जारी रखें",
        'Continue with GitLab': 'GitLab से जारी रखें',
        'Continue with Figma': 'Figma से जारी रखें',
        'Continue with LinkedIn': 'LinkedIn से जारी रखें',
        'Email Address': 'ईमेल पता',
        'you@example.com': 'you@example.com',
        'Password': 'पासवर्ड',
        'Your password': 'आपका पासवर्ड',
        'Sign In & Continue': 'साइन इन करें और आगे बढ़ें',
        'Signing in…': 'साइन इन हो रहा है…',
        'Forgot password?': 'पासवर्ड भूल गए?',
        'Don\'t have an account? <a>Create one, it\'s free</a>': 'खाता नहीं है? <a>मुफ़्त में बनाएँ</a>',
        'Reset <em>Password</em>': 'पासवर्ड <em>रीसेट करें</em>',
        'Enter your email and we\'ll send a reset link': 'अपना ईमेल डालें, हम आपको रीसेट लिंक भेजेंगे',
        'Reset link sent, check your inbox.': 'रीसेट लिंक भेज दिया गया है, अपना इनबॉक्स देखें।',
        'Send Reset Link': 'रीसेट लिंक भेजें',
        'Sending…': 'भेजा जा रहा है…',
        '← Back to Sign In': '← साइन इन पर वापस जाएँ',
        'Please enter your email address.': 'कृपया अपना ईमेल पता डालें।',
        'Join <em>neuropian</em>': '<em>neuropian</em> से जुड़ें',
        'Show what you\'ve built, find opportunities and join RoundTable': 'दिखाएँ कि आपने क्या बनाया है, अवसर खोजें और RoundTable से जुड़ें',
        'Already have an account? <a>Sign in</a>': 'पहले से खाता है? <a>साइन इन करें</a>',
        'Username': 'यूज़रनेम',
        'yourhandle': 'yourhandle',
        'Your public name in chat. Letters, numbers, underscores. More than 3 characters.': 'चैट में आपका सार्वजनिक नाम। अंग्रेज़ी अक्षर, अंक और अंडरस्कोर। 3 से ज़्यादा वर्ण।',
        'Must be more than 3 characters.': '3 से ज़्यादा वर्ण होने चाहिए।',
        'Letters, numbers, and underscores only.': 'सिर्फ़ अंग्रेज़ी अक्षर, अंक और अंडरस्कोर।',
        'Checking…': 'जाँच हो रही है…',
        'Username taken.': 'यह यूज़रनेम लिया जा चुका है।',
        'Available!': 'उपलब्ध है!',
        'First Name': 'पहला नाम',
        'Given name': 'आपका पहला नाम',
        'Last Name': 'उपनाम',
        'Family name': 'आपका उपनाम',
        'Date of Birth': 'जन्म तिथि',
        'Month': 'महीना', 'Day': 'दिन', 'Year': 'वर्ष',
        'Create a strong password': 'एक मज़बूत पासवर्ड बनाएँ',
        'At least 6 characters.': 'कम से कम 6 वर्ण।',
        'Profile Picture <span>- required</span>': 'प्रोफ़ाइल फ़ोटो <span>(ज़रूरी)</span>',
        'Brain Avatar': 'ब्रेन अवतार',
        'Upload Photo': 'फ़ोटो अपलोड करें',
        'Choose a logo variation': 'लोगो का कोई एक रूप चुनें',
        'Choose file': 'फ़ाइल चुनें',
        'Neuropian may share your profile with companies and funds that hire through us. By creating an account you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. You must be 18 or older.':
          'Neuropian आपकी प्रोफ़ाइल उन कंपनियों और फ़ंड के साथ साझा कर सकता है जो हमारे ज़रिए भर्ती करते हैं। खाता बनाकर आप <a>सेवा की शर्तों</a> और <a>गोपनीयता नीति</a> (अंग्रेज़ी में) से सहमत होते हैं। आपकी उम्र 18 वर्ष या उससे अधिक होनी चाहिए।',
        'Create Account & Continue': 'खाता बनाएँ और आगे बढ़ें',
        'Creating account…': 'खाता बन रहा है…',
        '← Back': '← वापस',
        'Terms of Service': 'सेवा की शर्तें (अंग्रेज़ी में)',
        'Privacy Policy': 'गोपनीयता नीति (अंग्रेज़ी में)',
        'Service unavailable. Please try again later.': 'सेवा अभी उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।',
        'Please fill in all fields.': 'कृपया सभी फ़ील्ड भरें।',
        'Please enter a valid email address.': 'कृपया एक मान्य ईमेल पता डालें।',
        'Please choose a profile picture or select a brain avatar.': 'कृपया प्रोफ़ाइल फ़ोटो चुनें या कोई ब्रेन अवतार चुनें।',
        'Username must be more than 3 characters.': 'यूज़रनेम 3 वर्णों से ज़्यादा का होना चाहिए।',
        'Username can only contain letters, numbers, and underscores.': 'यूज़रनेम में सिर्फ़ अंग्रेज़ी अक्षर, अंक और अंडरस्कोर हो सकते हैं।',
        'Please enter your real date of birth.': 'कृपया अपनी असली जन्म तिथि डालें।',
        'You must be 18 or older to create an account.': 'खाता बनाने के लिए आपकी उम्र 18 वर्ष या उससे अधिक होनी चाहिए।',
        'Password must be at least 6 characters.': 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए।',
        'That username is already taken. Please choose another.': 'यह यूज़रनेम पहले से लिया जा चुका है। कृपया कोई दूसरा चुनें।',
        'This email already has an account. Sign in with your password, or use Forgot password.': 'इस ईमेल से पहले से एक खाता है। अपने पासवर्ड से साइन इन करें, या “पासवर्ड भूल गए?” इस्तेमाल करें।',
        'Set New Password': 'नया पासवर्ड सेट करें',
        'Enter and confirm your new password.': 'अपना नया पासवर्ड डालें और उसकी पुष्टि करें।',
        'New Password': 'नया पासवर्ड',
        'New password': 'नया पासवर्ड',
        'Confirm Password': 'पासवर्ड की पुष्टि करें',
        'Confirm new password': 'नया पासवर्ड दोबारा डालें',
        'Update Password': 'पासवर्ड अपडेट करें',
        'Updating…': 'अपडेट हो रहा है…',
        'Please fill in both fields.': 'कृपया दोनों फ़ील्ड भरें।',
        'Passwords do not match.': 'दोनों पासवर्ड मेल नहीं खाते।',
        'Updated terms · 18 October 2026': 'अपडेट की गई शर्तें · 18' + NB + 'अक्टूबर' + NB + '2026',
        'Before you continue: Neuropian may share member profiles with companies and funds that hire through us. Nothing from your account is shared unless you accept. Read the <a>Terms</a> and <a>Privacy Policy</a>.':
          'आगे बढ़ने से पहले: Neuropian सदस्यों की प्रोफ़ाइल उन कंपनियों और फ़ंड के साथ साझा कर सकता है जो हमारे ज़रिए भर्ती करते हैं। जब तक आप स्वीकार नहीं करते, आपके खाते से कुछ भी साझा नहीं किया जाता। <a>शर्तें</a> और <a>गोपनीयता नीति</a> (अंग्रेज़ी में) पढ़ें।',
        'I am 18 or older': 'मेरी उम्र 18 वर्ष या उससे अधिक है',
        'Accept and continue': 'स्वीकार करें और आगे बढ़ें',
        'Not now (sign out)': 'अभी नहीं (साइन आउट)',
        'Neuropian is now for adults (18+), so this account is paused. Nothing from it is shared. To download or delete your data, email <a>dylan@neuropian.com</a>.':
          'Neuropian अब सिर्फ़ वयस्कों (18+) के लिए है, इसलिए यह खाता रोक दिया गया है। इससे कुछ भी साझा नहीं किया जाता। अपना डेटा डाउनलोड करने या मिटाने के लिए <a>dylan@neuropian.com</a> पर ईमेल करें।',
        'Invalid login credentials': 'ईमेल या पासवर्ड गलत है।',
        'Email not confirmed': 'आपका ईमेल अभी पुष्ट नहीं हुआ है: हमारा भेजा हुआ लिंक खोलें।',
        'User already registered': 'इस ईमेल से पहले से एक खाता है।',
        'Unable to validate email address: invalid format': 'यह ईमेल पता मान्य नहीं है।',
        'Password is known to be weak and easy to guess, please choose a different one.': 'यह पासवर्ड बहुत आम है और आसानी से अनुमान लगाया जा सकता है। कृपया कोई दूसरा पासवर्ड चुनें।',
        'Email rate limit exceeded': 'बहुत सारे ईमेल भेजे जा चुके हैं। कुछ मिनट बाद फिर कोशिश करें।',
        'Request rate limit reached': 'बहुत ज़्यादा कोशिशें हुईं। कुछ मिनट बाद फिर कोशिश करें।',
        'Too many requests': 'बहुत ज़्यादा कोशिशें हुईं। कुछ मिनट बाद फिर कोशिश करें।',
        'Signups not allowed for this instance': 'अभी नए खाते नहीं बनाए जा सकते।',
        'Database error saving new user': 'खाता नहीं बन सका। कृपया बाद में फिर कोशिश करें।',
        'Neuropian is for adults (18+)': 'Neuropian सिर्फ़ 18 वर्ष या उससे अधिक उम्र के लोगों के लिए है।',
        'Failed to fetch': 'सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
        'Load failed': 'सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
        'NetworkError when attempting to fetch resource.': 'सर्वर से संपर्क नहीं हो सका। अपना कनेक्शन जाँचें और फिर कोशिश करें।',
        'New password should be different from the old password.': 'नया पासवर्ड पुराने पासवर्ड से अलग होना चाहिए।',
        'Auth session missing!': 'आपका सत्र समाप्त हो गया है। फिर से साइन इन करें।',
        'Error sending recovery email': 'ईमेल नहीं भेजा जा सका। कृपया बाद में फिर कोशिश करें।',
        'Error sending confirmation email': 'ईमेल नहीं भेजा जा सका। कृपया बाद में फिर कोशिश करें।'
      }
    },

    zh: {
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      colors: ['黑色', '蓝色', '蓝绿色', '紫色', '珊瑚色', '金色', '粉色', '绿松石色', '森林绿', '靛蓝', '赤陶色', '紫水晶色', '芥末黄', '孔雀蓝', '深红', '石板灰'],
      rx: [
        '密码至少需要 $1 个字符。',
        '出于安全考虑，请在 $1 秒后再试。',
        '出于安全考虑，每 $1 秒只能请求一次。',
        '邮箱地址无效。',
        '密码必须包含以下每一类字符中的至少一个：$1',
        '无法保存：$1'
      ],
      t: {
        'Close': '关闭',
        'Sign <em>In</em>': '账号<em>登录</em>',
        'Access your profile and opportunities': '访问你的个人资料和机会',
        'By continuing you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a> and confirm you are 18 or older. Neuropian reads your public work there to build your profile.':
          '继续即表示你同意<a>服务条款</a>和<a>隐私政策</a>（英文），并确认你已年满 18 岁。Neuropian 会读取你在该平台上的公开作品，用来建立你的个人资料。',
        'or with email': '或使用邮箱',
        'Continue with GitHub': '使用 GitHub 继续',
        "Sign in to view <em>Talent</em>": "登录以查看 <em>Talent</em>",
        "Search builders by the work they've shipped. Free while we're early.": "按已交付的作品搜索构建者。早期阶段免费。",
        "Discover <em>opportunities</em>": "发现<em>机会</em>",
        "For builders search engines miss. Sign in with GitHub and see your draft profile in seconds, made from the pull requests you've had merged. Free. Nothing goes public until you publish, and it never shows your email or location.": "为搜索引擎错过的构建者而设。使用 GitHub 登录，几秒钟内就能看到根据你被合并的拉取请求生成的个人资料草稿。免费。在你发布之前不会公开任何内容，并且绝不显示你的邮箱或所在地。",
        "or": "或",
        "Sign up with email": "使用邮箱注册",
        "Continue with Google": "使用 Google 继续",
        'Continue with GitLab': '使用 GitLab 继续',
        'Continue with Figma': '使用 Figma 继续',
        'Continue with LinkedIn': '使用 LinkedIn 继续',
        'Email Address': '邮箱地址',
        'you@example.com': 'you@example.com',
        'Password': '密码',
        'Your password': '你的密码',
        'Sign In & Continue': '登录并继续',
        'Signing in…': '正在登录…',
        'Forgot password?': '忘记密码？',
        'Don\'t have an account? <a>Create one, it\'s free</a>': '还没有账号？<a>免费创建一个</a>',
        'Reset <em>Password</em>': '重置<em>密码</em>',
        'Enter your email and we\'ll send a reset link': '输入你的邮箱，我们会发送重置链接',
        'Reset link sent, check your inbox.': '重置链接已发送，请查收邮件。',
        'Send Reset Link': '发送重置链接',
        'Sending…': '正在发送…',
        '← Back to Sign In': '← 返回登录',
        'Please enter your email address.': '请输入你的邮箱地址。',
        'Join <em>neuropian</em>': '加入 <em>neuropian</em>',
        'Show what you\'ve built, find opportunities and join RoundTable': '展示你构建的东西，寻找机会，加入 RoundTable',
        'Already have an account? <a>Sign in</a>': '已有账号？<a>登录</a>',
        'Username': '用户名',
        'yourhandle': 'yourhandle',
        'Your public name in chat. Letters, numbers, underscores. More than 3 characters.': '你在聊天中的公开名称。仅限英文字母、数字和下划线，长度须超过 3 个字符。',
        'Must be more than 3 characters.': '须超过 3 个字符。',
        'Letters, numbers, and underscores only.': '只能使用英文字母、数字和下划线。',
        'Checking…': '正在检查…',
        'Username taken.': '用户名已被占用。',
        'Available!': '可以使用！',
        'First Name': '名',
        'Given name': '请输入名',
        'Last Name': '姓',
        'Family name': '请输入姓',
        'Date of Birth': '出生日期',
        'Month': '月', 'Day': '日', 'Year': '年',
        'Create a strong password': '设置一个强密码',
        'At least 6 characters.': '至少 6 个字符。',
        'Profile Picture <span>- required</span>': '头像<span>（必填）</span>',
        'Brain Avatar': '大脑头像',
        'Upload Photo': '上传照片',
        'Choose a logo variation': '选择一种标志样式',
        'Choose file': '选择文件',
        'Neuropian may share your profile with companies and funds that hire through us. By creating an account you agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>. You must be 18 or older.':
          'Neuropian 可能会将你的个人资料分享给通过我们招聘的公司和基金。创建账号即表示你同意<a>服务条款</a>和<a>隐私政策</a>（英文）。你必须年满 18 岁。',
        'Create Account & Continue': '创建账号并继续',
        'Creating account…': '正在创建账号…',
        '← Back': '← 返回',
        'Terms of Service': '服务条款（英文）',
        'Privacy Policy': '隐私政策（英文）',
        'Service unavailable. Please try again later.': '服务暂不可用，请稍后再试。',
        'Please fill in all fields.': '请填写所有字段。',
        'Please enter a valid email address.': '请输入有效的邮箱地址。',
        'Please choose a profile picture or select a brain avatar.': '请选择一张头像照片，或选择一个大脑头像。',
        'Username must be more than 3 characters.': '用户名须超过 3 个字符。',
        'Username can only contain letters, numbers, and underscores.': '用户名只能包含英文字母、数字和下划线。',
        'Please enter your real date of birth.': '请填写你真实的出生日期。',
        'You must be 18 or older to create an account.': '你必须年满 18 岁才能创建账号。',
        'Password must be at least 6 characters.': '密码至少需要 6 个字符。',
        'That username is already taken. Please choose another.': '该用户名已被占用，请换一个。',
        'This email already has an account. Sign in with your password, or use Forgot password.': '该邮箱已有账号。请用密码登录，或使用“忘记密码？”。',
        'Set New Password': '设置新密码',
        'Enter and confirm your new password.': '输入并确认你的新密码。',
        'New Password': '新密码',
        'New password': '新密码',
        'Confirm Password': '确认密码',
        'Confirm new password': '再次输入新密码',
        'Update Password': '更新密码',
        'Updating…': '正在更新…',
        'Please fill in both fields.': '请填写两个字段。',
        'Passwords do not match.': '两次输入的密码不一致。',
        'Updated terms · 18 October 2026': '条款已更新 · 2026' + NB + '年' + NB + '10' + NB + '月' + NB + '18' + NB + '日',
        'Before you continue: Neuropian may share member profiles with companies and funds that hire through us. Nothing from your account is shared unless you accept. Read the <a>Terms</a> and <a>Privacy Policy</a>.':
          '继续之前：Neuropian 可能会将成员的个人资料分享给通过我们招聘的公司和基金。除非你接受，否则你账号中的任何内容都不会被分享。请阅读<a>条款</a>和<a>隐私政策</a>（英文）。',
        'I am 18 or older': '我已年满 18 岁',
        'Accept and continue': '接受并继续',
        'Not now (sign out)': '暂不（退出登录）',
        'Neuropian is now for adults (18+), so this account is paused. Nothing from it is shared. To download or delete your data, email <a>dylan@neuropian.com</a>.':
          'Neuropian 现在仅面向成年人（18 岁及以上），因此这个账号已暂停，其中的任何内容都不会被分享。如需下载或删除你的数据，请发邮件至 <a>dylan@neuropian.com</a>。',
        'Invalid login credentials': '邮箱或密码不正确。',
        'Email not confirmed': '你的邮箱尚未确认：请打开我们发给你的链接。',
        'User already registered': '该邮箱已注册账号。',
        'Unable to validate email address: invalid format': '邮箱地址无效。',
        'Password is known to be weak and easy to guess, please choose a different one.': '这个密码太常见，容易被猜到，请换一个。',
        'Email rate limit exceeded': '发送的邮件过多，请几分钟后再试。',
        'Request rate limit reached': '尝试次数过多，请几分钟后再试。',
        'Too many requests': '尝试次数过多，请几分钟后再试。',
        'Signups not allowed for this instance': '目前暂不开放注册。',
        'Database error saving new user': '无法创建账号，请稍后再试。',
        'Neuropian is for adults (18+)': 'Neuropian 仅面向年满 18 岁的成年人。',
        'Failed to fetch': '无法连接服务器，请检查网络后重试。',
        'Load failed': '无法连接服务器，请检查网络后重试。',
        'NetworkError when attempting to fetch resource.': '无法连接服务器，请检查网络后重试。',
        'New password should be different from the old password.': '新密码不能与旧密码相同。',
        'Auth session missing!': '登录状态已失效，请重新登录。',
        'Error sending recovery email': '邮件发送失败，请稍后再试。',
        'Error sending confirmation email': '邮件发送失败，请稍后再试。'
      }
    }
  };

  var D = DICT[L];
  if (!D) return;
  var HL = { fr: 'fr', es: 'es', he: 'he', hi: 'hi', zh: 'zh-Hans' }[L], RTL = L === 'he';
  var T = {}, LC = {}, VALS = new Set(), k;
  for (k in D.t) T[norm(k)] = D.t[k];
  M_EN.forEach(function (m, i) { T[m] = D.months[i]; });
  COLORS_EN.forEach(function (c, i) { T[c] = D.colors[i]; });
  for (k in T) { LC[k.toLowerCase()] = T[k]; VALS.add(norm(T[k])); }
  var miss = window.__npI18nMiss = new Set();
  var LETTER = /\p{L}/u;
  var INLINE = { A: 1, EM: 1, B: 1, STRONG: 1, I: 1, SPAN: 1, CODE: 1, BR: 1, BDI: 1, SMALL: 1 };
  var ATTRS = ['title', 'placeholder', 'aria-label'];
  var BOXES = ['auth-gate', 'terms-gate', 'set-password-modal'];

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function letters(s) { return LETTER.test(s); }
  function look(en) {
    var key = norm(en);
    if (Object.prototype.hasOwnProperty.call(T, key)) return T[key];
    if (Object.prototype.hasOwnProperty.call(LC, key.toLowerCase())) return LC[key.toLowerCase()];
    for (var i = 0; i < RX.length; i++) {
      var m = key.match(RX[i]);
      if (!m) continue;
      var arg = m[1] === undefined ? '' : m[1];
      if (NESTED[i]) { var inner = look(arg); if (inner != null) arg = inner; }
      var out = D.rx[i].replace('$1', arg);
      VALS.add(norm(out));
      return out;
    }
    return null;
  }
  function seen(key) { return VALS.has(key); }
  function keyOf(n) {
    if (n.nodeType === 3) return n.data;
    if (n.nodeType !== 1) return '';
    var t = n.tagName.toLowerCase();
    if (t === 'br') return '<br>';
    return '<' + t + '>' + Array.prototype.map.call(n.childNodes, keyOf).join('') + '</' + t + '>';
  }
  function text(n) {
    var s = n.data, key = norm(s);
    if (!key || !letters(key)) return;
    var tr = look(key);
    if (tr == null) { if (!seen(key)) miss.add(key); return; }
    var v = s.match(/^\s*/)[0] + tr + s.match(/\s*$/)[0];
    if (n.data !== v) n.data = v;
  }
  function attrs(el) {
    ATTRS.forEach(function (a) {
      var v = el.getAttribute(a);
      if (v == null) return;
      var key = norm(v);
      if (!key || !letters(key)) return;
      var tr = look(key);
      if (tr == null) { if (!seen(key)) miss.add('[' + a + '] ' + key); return; }
      if (tr !== v) el.setAttribute(a, tr);
    });
  }
  function run(parent, nodes) {
    var mixed = nodes.some(function (n) { return n.nodeType === 3 && letters(n.data); }) &&
                nodes.some(function (n) { return n.nodeType === 1 && letters(n.textContent); });
    if (!mixed) { nodes.forEach(function (n) { if (n.nodeType === 3) text(n); else walk(n); }); return; }
    var key = norm(nodes.map(keyOf).join(''));
    var tr = look(key);
    if (tr == null) { if (!seen(key)) miss.add(key); return; }
    var tpl = document.createElement('template'), pool = {};
    tpl.innerHTML = tr;
    nodes.forEach(function add(n) {
      if (n.nodeType !== 1) return;
      (pool[n.tagName] = pool[n.tagName] || []).push(n);
      Array.prototype.forEach.call(n.children, add);
    });
    Array.prototype.forEach.call(tpl.content.querySelectorAll('*'), function (e) {
      var o = (pool[e.tagName] || []).shift();
      if (o) Array.prototype.forEach.call(o.attributes, function (a) { e.setAttribute(a.name, a.value); });
    });
    parent.insertBefore(tpl.content, nodes[0]);
    nodes.forEach(function (n) { if (n.parentNode === parent) parent.removeChild(n); });
  }
  function walk(el) {
    if (el.nodeType !== 1 || el.getAttribute('translate') === 'no') return;
    if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
    attrs(el);
    var kids = Array.prototype.slice.call(el.childNodes), cur = [];
    for (var i = 0; i <= kids.length; i++) {
      var n = kids[i];
      if (n && (n.nodeType === 3 || (n.nodeType === 1 && INLINE[n.tagName]))) { cur.push(n); continue; }
      if (cur.length) { run(el, cur); cur = []; }
      if (n && n.nodeType === 1) walk(n);
    }
  }
  /* the date of birth in the order people write it: day month year, or 年 月 日 in Chinese.
     The selects keep their own change handler (app.html _dobSelects), so the hidden field still gets YYYY-MM-DD. */
  function dob() {
    var inp = document.getElementById('rg-dob'), w = inp && inp.nextElementSibling;
    if (!w || !w.classList.contains('dob-sel') || w.dataset.np) return;
    var s = w.querySelectorAll('select');
    if (s.length !== 3) return;
    w.dataset.np = '1';
    (L === 'zh' ? [2, 0, 1] : [1, 0, 2]).forEach(function (i) { w.appendChild(s[i]); });
  }

  /* he, hi, zh: serif, display and label fonts with the script's Noto face (as on the home pages); the small-caps labels
     put the script's sans first, since a monospace space between Hebrew/Hindi/Chinese words looks like a gap; no
     letter-spacing made for capitals. Hindi: the app's font-size-adjust (.46) shrinks Devanagari next to Latin words, so
     it is off there and the smallest text is a little larger. */
  var F = {
    he: ['"EB Garamond","Noto Serif Hebrew",Garamond,Georgia,serif', '"DM Serif Display","Frank Ruhl Libre","Noto Serif Hebrew",Georgia,serif',
         '"Noto Sans Hebrew","JetBrains Mono",ui-monospace,Menlo,monospace', '.02em', '12px', '12px',
         'family=Frank+Ruhl+Libre:wght@400;500;700&family=Noto+Serif+Hebrew:wght@400;500;600&family=Noto+Sans+Hebrew:wght@400;500'],
    hi: ['"EB Garamond","Noto Serif Devanagari",Garamond,Georgia,serif', '"DM Serif Display","Tiro Devanagari Hindi","Noto Serif Devanagari",Georgia,serif',
         '"Noto Sans Devanagari","JetBrains Mono",ui-monospace,Menlo,monospace', '0', '13px', '13px',
         'family=Tiro+Devanagari+Hindi:ital@0;1&family=Noto+Serif+Devanagari:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500'],
    zh: ['"EB Garamond","Noto Serif SC",Garamond,Georgia,serif', '"DM Serif Display","Noto Serif SC",Georgia,serif',
         '"Noto Sans SC","JetBrains Mono",ui-monospace,Menlo,monospace', '.06em', '12px', '12px',
         'family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500']
  }[L];
  function style() {
    var B = 'html:not(#np-x) :is(#auth-gate,#terms-gate,#set-password-modal)', css = '';
    if (F) {
      css += B + ' *:not(svg):not(svg *){font-family:' + F[0] + '!important}\n' +
             B + ' :is(.auth-title,.auth-title *,[style*="Playfair"]){font-family:' + F[1] + '!important}\n' +
             B + ' :is([style*="text-transform:uppercase"],.np-or,.auth-field label,.auth-switch,.auth-switch a){font-family:' + F[2] + '!important;letter-spacing:' + F[3] + '!important}\n' +
             B + ' .auth-field label{font-size:' + F[4] + '!important;line-height:1.5}\n' +
             B + ' .auth-switch{font-size:' + F[5] + '!important;line-height:1.6}\n' +
             B + ' .auth-title{line-height:1.25}\n';
      if (L === 'hi') css += B + ' *{font-size-adjust:none!important}\n' + B + ' [style*="font-size:.5"]{font-size:12.5px!important}\n' +
                             B + ' .np-oa-note,.rg-notice{line-height:1.7}\n';
      var ln = document.createElement('link');
      ln.rel = 'stylesheet'; ln.href = 'https://fonts.googleapis.com/css2?' + F[6] + '&display=swap';
      document.head.appendChild(ln);
    }
    if (RTL) {   // right to left: mirror what the app placed with left/right; e-mail and passwords are typed left to right
      css += 'html:not(#np-x) #auth-gate[dir=rtl] .auth-close{right:auto!important;left:1.2rem!important}\n' +
             'html:not(#np-x) #auth-gate[dir=rtl] #auth-login-view>div[style*="text-align:right"]{text-align:left!important}\n' +
             'html:not(#np-x) :is(#auth-gate,#set-password-modal)[dir=rtl] :is(input[type=email],input[type=password],#rg-username){direction:ltr;text-align:right}\n';
    }
    if (!css) return;
    var st = document.createElement('style');
    st.id = 'np-auth-i18n';
    st.textContent = css;
    document.head.appendChild(st);
  }

  var obs = null;
  function applyAll() {
    BOXES.forEach(function (id) { var b = document.getElementById(id); if (b) walk(b); });
    dob();
  }
  function start() {
    BOXES.forEach(function (id) {
      var b = document.getElementById(id);
      if (!b) return;
      b.setAttribute('lang', HL);
      if (RTL) b.setAttribute('dir', 'rtl');
    });
    ['auth-legal-body', 'rg-upload-name'].forEach(function (id) {   // the English legal text; the user's own file name
      var e = document.getElementById(id);
      if (e) { e.setAttribute('translate', 'no'); if (id === 'auth-legal-body') { e.setAttribute('lang', 'en'); e.setAttribute('dir', 'ltr'); } }
    });
    style();
    applyAll();
    obs = new MutationObserver(function () { applyAll(); obs.takeRecords(); });
    BOXES.forEach(function (id) {
      var b = document.getElementById(id);
      if (b) obs.observe(b, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
