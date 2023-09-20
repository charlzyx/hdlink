import Home from "./pages/Home.vue";
import Links from "./pages/Links.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: Home },
  { path: "/links", component: Links },
];
// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
export const router = createRouter({
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
});
