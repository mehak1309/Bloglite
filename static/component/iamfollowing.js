import navbar from './navbar.js'

export default {
    template:`
    <div>
    <navbar> </navbar> <br> <br>
    <p style="font-size:20px; margin-left:1em;">Following These Users</p>   <br>
    <div class="row">
    <div class="col-12 mx-3">

    <p v-for="following in follow_data[0]['iamfollowing']" v-if="following.following_id!=my_id">
    <img :src="'../static/user_profile_pics/'+following['profile_picture']" class="avatar">
    <router-link :to="{name: 'other_users_profile_name', params: {id: following['following_id']}}">{{following['email']}}</router-link>
    </p>
    </div>
    <div class="col-4"> </div>
    </div>
    </div>
    `,
    mounted:function(){
      document.title = "Following"
      fetch("http://127.0.0.1:5000/api/getfollowdetails/currentuser").then(response=>response.json()).then(response1=>{console.log(response1)
        this.my_id=response1[0]["theuser"]
        this.follow_data=response1})
        console.log(this.follow_data)  
    },
    components:{
      navbar,
    },
    data: function(){
        return {
        follow_data:[],
        my_id:null,
        }
    },
    methods:{
        count_likes(){
           
        },
        
    }
}

