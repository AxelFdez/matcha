import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '@/pages/HomePage.vue';
import MainPage from '@/pages/MainPage.vue';
import ProfilePage from '@/pages/ProfilePage.vue';
import RegisterPage from '@/pages/RegisterPage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import ForgotPassPage from '@/pages/ForgotPassPage.vue';
import ResetPasswordPage from '@/pages/ResetPasswordPage.vue';
import ChangeEmailPage from '@/pages/ChangeEmailPage.vue';
import test from '@/pages/test.vue';

export const routes = [
    { path: '/', name:'HomePage', component: HomePage },
    { path: '/MainPage', name:'MainPage', component: MainPage },
    { path: '/ProfilePage', name:'ProfilePage', component: ProfilePage },
    { path: '/RegisterPage/', name: 'RegisterPage', component: RegisterPage },
    { path: '/LoginPage/', name: 'LoginPage', component: LoginPage },
    { path: '/ForgotPassPage/', name: 'ForgotPassPage', component: ForgotPassPage },
    { path: '/ResetPasswordPage/', name: 'ResetPasswordPage', component: ResetPasswordPage },
    { path: '/ChangeEmailPage/', name: 'ChangeEmailPage', component: ChangeEmailPage },
    { path: '/test/', name: 'test', component: test },

]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})
