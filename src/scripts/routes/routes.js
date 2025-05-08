import homePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import addStoryPage from "../pages/add-story-page/add-story-page.js";
import loginPage from "../pages/login/login-page.js";
import registerPage from "../pages/register/register-page.js";
import detailPage from "../pages/detail/detail-page.js";

const routes = {
  "/": homePage,
  "/about": new AboutPage(),
  "/add": addStoryPage,
  "/login": loginPage,
  "/register": registerPage,
  "/detail/:id": detailPage,
};

export default routes;
