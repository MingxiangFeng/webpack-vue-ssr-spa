import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      {
        name: 'home',
        path: '/',
        component: () => import('../views/home.vue')
      }, {
        name: 'list',
        path: '/list',
        component: () => import('../views/list.vue')
      }
    ]
  })
}
