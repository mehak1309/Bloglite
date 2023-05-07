import navbar from './navbar.js'
import other_users_profile from './other_users_profile.js'

export default{
    template:`
    <div>
    <navbar/>
    <div class="row">
    <br> <br>  
    

    <div class="col px-4 my-3 mx-auto"> <br><br>
    <form method="POST">
    <div class="input-group mb-3">
    <input type="text" name="searched" class="form-control" @input="search_for_user" v-model="search_user" placeholder="email" aria-label="Recipient's username" aria-describedby="basic-addon2">
    <div class="input-group-append">
    </div>
  </div> 
  </form>
  <br>



<div v-for="user in search_for_user" v-if="user.id!=my_id">
<div class="row">
 <div class="col-md-4 py-2 col-sm-auto">
  <img :src="'../static/user_profile_pics/'+user.profile_picture" class="avatar">
  <router-link :to="{name: 'other_users_profile_name', params: {id: user.id}}">  {{user.email}}  </router-link>
</div>
<div class="col-md-4 py-3 col-sm-auto">
   <button type="button" v-if="!check_follow(user.id)" class="btn btn-primary" @click="update_follow(user.id)">Follow</button>
   <button type="button" v-else class="btn btn-primary" @click="update_unfollow(user.id)">Unfollow</button>
</div>
</div>
  </div>



  </div>
 
</div>
  </div>
    `,
    mounted:function(){
      document.title = "Search"
      fetch("http://127.0.0.1:5000/api/getallusersdetails").then(response=>response.json()).then(response1=>{console.log(response1)
        this.all_users=response1})
        console.log(this.all_users)

        fetch("http://127.0.0.1:5000/api/getfollowdetails/currentuser").then(response=>response.json()).then(response1=>{console.log(response1)
        let data1=[]
        this.my_id = response1[0]["theuser"]
        for(let i=0; i< Object.keys(response1[0]['iamfollowing']).length; i++){
          data1.push(response1[0]['iamfollowing'][i]['following_id'])
        }
        this.follow_data=data1})
    },
    components:{
      navbar,
    },
    computed: {
     
  },
    data:function(){
      return{
        search_user:"",
        all_users:[],
        show1:false,
        display:null,
        status:true,
        is_following:false,
        followcolor:"bg-primary",
        unfollowcolor:"bg-danger",
        follow_data:[],
        my_id:null,
      }
    },
    computed:{
      search_for_user() {
        return this.all_users.filter(p => {
    
          return p.email.toLowerCase().indexOf(this.search_user.toLowerCase()) != -1;
        });
      },
    
    },
    watch:{

    },
    methods:{
      check_follow(id){
        return this.follow_data.includes(id)
      },
      update_unfollow(id){
        const form_data = new FormData()
        form_data.append("following", false)  
        form_data.append("id", id)     
        fetch(`http://127.0.0.1:5000/api/unfollow_user`, {
        method:"DELETE",
        body: form_data,
      }).then(response => response.json()).then(data => {
        console.log(data)
        location.reload();
      })
      },

      // search_for_user(){
      //   for(let i of this.all_users){
      //     if (i.email===this.search_user){
      //       this.display = i
      //       return this.show1=true
      //     }
      //   }
      //   this.display="No Users Exist"
      //   return this.show1=true
     
      // },

      
  
      update_follow(id){
        const form_data = new FormData()
        form_data.append("following", true)  
        form_data.append("id", id)     
        fetch(`http://127.0.0.1:5000/api/follow_user`, {
        method:"POST",
        body: form_data,
      }).then(response => response.json()).then(data => {
        console.log(data)
        location.reload();
        this.followcolor="bg-warning"
      })
      },
   
    
    }
  }