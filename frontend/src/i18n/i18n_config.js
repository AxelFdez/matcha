import { createI18n } from 'vue-i18n'

import {
	aboutProjectFooter_en,
    aboutProjectFooter_fr,
    accountCreatedText_en,
    accountCreatedText_fr,
		registrationErrorText_fr,
		registrationErrorText_en,
		registrationErrorUsernameText_en,
		registrationErrorUsernameText_fr,
		registrationErrorEmailText_en,
		registrationErrorEmailText_fr,
		loginSuccessText_en,
		loginSuccessText_fr,
		loginFailText_en,
		loginFailText_fr,
} from '@/data/data.js'

export const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages: {
    en: {
			hello: 'Hello',
      send: 'Send',
      userName: 'username',
      firstName: 'first name',
      lastName: 'last name',
      password: 'password',
      passwordConfirm: 'confirm password',
      accountCreate_btn: 'Create account',

      registerTitle: 'create an account',
      registerSubTitle: 'and start swiping !',

      accountCreatedTitle: 'account created',
      accountCreatedText: accountCreatedText_en,

      errorTitle: 'Oups !',
			serverErrorText: registrationErrorText_en,

			registrationErrorUsernameText: registrationErrorUsernameText_en,

			registrationErrorEmailText: registrationErrorEmailText_en,

			loginSuccessText: loginSuccessText_en,

			loginFailText: loginFailText_en,
      wrongPasswordText: 'Wrong Password !',
      emailNotVerifiedText: 'Please verify your email address to log in.',

      changeEmail : 'Change Email',
      reSendEmail: 'Resend email',
      reSendEmail_emailSent: 'Email sent',
      reSendEmail_userNotMatch: 'User not match !',
      reSendEmail_alreadyVerified: 'E-mail already used or verified !',
      reSendEmail_serverError: 'Server error, try again later...',

      forgotPassword: 'Forgot password ?',
      forgotPasswordEmaiSentSuccess: 'An email has been sent,\
      Please check your mailbox to change your password.',
      forgotPasswordEmaiSentFail: 'Email not match with any account,\
      Please enter the address you used when creating the account.',


      resetPassword: 'reset password',
      resetPasswordInfo: 'Enter the email address you used when creating the account :',
      resetPasswordBtn: 'Reset Password',
      changeEmailBtn: 'Change Email',

      changeEmailTitle: 'Please enter your new email address.',
      changeEmailSuccess: 'Your email address has been successfully changed. \n \
      You will be logged out and will need to verify your new email address to continue using your account.',


      connect: 'Connect',
      disconnect: 'Log out',
      contactUs: 'To Contact Us',
      projectMadeBy: 'a 42 school project created by :',
      aboutProjectFooter: aboutProjectFooter_en,
      // autres clés et traductions pour l'anglais
    },
    fr: {
			hello: 'Bonjour',
      send: 'Envoyer',
      userName: 'nom d\'utilisateur',
      firstName: 'prénom',
      lastName: 'nom',
      password: 'mot de passe',
      passwordConfirm: 'confirmer le mot de passe',
      accountCreate_btn: 'Créer un compte',

      registerTitle: 'créer un compte',
      registerSubTitle: 'et commencer à swiper !',

      accountCreatedTitle: 'compte crée',
      accountCreatedText: accountCreatedText_fr,

      errorTitle: 'Oups !',
			serverErrorText: registrationErrorText_fr,

			registrationErrorUsernameText: registrationErrorUsernameText_fr,

			registrationErrorEmailText: registrationErrorEmailText_fr,

			loginSuccessText: loginSuccessText_fr,

			loginFailText: loginFailText_fr,
      wrongPasswordText: 'Mot de passe incorrect !',
      emailNotVerifiedText: 'Merci de vérifier votre adresse e-mail pour vous connecter.',

      changeEmail : 'Changer l\'Email',
      reSendEmail: 'Renvoyer le mail',
      reSendEmail_emailSent: 'E-mail envoyé',
      reSendEmail_userNotMatch: 'Utilisateur non trouvé !',
      reSendEmail_alreadyVerified: 'E-mail déjà utilisé ou verifié !',
      reSendEmail_serverError: 'Erreur serveur, veuillez réessayer plus tard...',


      forgotPassword: 'Mot de passe oublié ?',
      forgotPasswordEmaiSentSuccess: 'Un email a été envoyé,\
      Merci de vérifier votre boîte mail pour changer votre mot de passe.',
      forgotPasswordEmaiSentFail: 'L\'e-mail ne correspond à aucun compte.\
      Veuillez saisir l\'adresse que vous avez utilisée lors de la création du compte.',


      resetPassword: 'Reinitialiser Mdp',
      resetPasswordInfo: 'Saisissez l’adresse e‑mail que vous avez utilisé lors de la création du compte :',
      resetPasswordBtn: 'Changer mot de passe',
      changeEmailBtn: 'Changer Email',
      changeEmailTitle: 'Veuillez entrer votre nouvelle adresse e-mail.',
      changeEmailSuccess: 'Votre adresse email a été modifiée avec succès.\n \
                          Vous serez déconnecté(e) et devrez vérifier votre nouvelle adresse email pour continuer à utiliser votre compte.',
      connect: 'Connexion',
      disconnect: 'Déonnexion',
      contactUs: 'Nous Contacter',
      projectMadeBy: "un projet de l'école 42 réalisé par :",
      aboutProjectFooter: aboutProjectFooter_fr,
      // autres clés et traductions pour le français
    }
    // ajoutez d'autres langues si nécessaire
  }
})