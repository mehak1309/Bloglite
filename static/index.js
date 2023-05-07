import add_post from './component/add_post.js'
import login from './component/login.js'
import my_posts from './component/my_posts.js'
import navbar from './component/navbar.js'
// import edit_account from './component/edit_account.js'
import account from './component/account.js'
import newsfeed from './component/newsfeed.js'
import search from './component/search.js'
import signup from './component/signup.js'
import following from './component/iamfollowing.js'
import follower from './component/followingme.js'
import profile_top from './component/profile_top.js'
import other_users_profile from './component/other_users_profile.js'



const routes = [
    {path: '/login', component:login},
    {path: '/profile', component:profile_top},
    {path: '/newsfeed', component:newsfeed},
    {path: '/search', component:search},
    {path: '/add_post', component:add_post},
    {path: '/signup', component:signup},
    {path: '/account', component:account},
    {path: '/following', component:following},
    {path: '/followers', component:follower},
    {path: '/other_users_profile/:id/details', name:"other_users_profile_name", component:other_users_profile},
    {path: '/', component:login}
]


const router = new VueRouter({
    routes,
})


new Vue({
    el:"#app",
    template:`
    <div>
      <router-view> </router-view> 
    </div>
    `,

    router,

    components: {
        navbar,
    },

})