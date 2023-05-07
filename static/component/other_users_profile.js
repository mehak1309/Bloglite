import my_posts from './my_posts.js'
import navbar from './navbar.js'

export default{
    template:`
    <div>
    <navbar/>
    <!--Profile Top-->
    <br> 

    <div class="row mx-4">
      <div class="col-2">
      <figure> 
      <h5 style="text-align: center;"> <img :src="'../static/user_profile_pics/'+user_data[0].profile_picture" alt="Avatar" class="avatar1" style="height:100px; width:100px;">    
      <br>
      <figcaption>{{user_data[0].name}}</figcaption>
      </h5>
      </figure>
      </div>
      <div class="col-1">
      </div>
      <div class="col-3" style="font-size:20px;">
      Total Posts
      </div>
      <div class="col-3" style="font-size:20px;">
      Follows
      </div>
      <div class="col-3" style="font-size:20px;">
      Followed By 
      </div>     
    </div>


    <div class="row top1">
    <div class="col-3"> 
    </div>
    <div class="col-3">
    <p style="margin-left:50px;"> {{total_posts}} </p>
    </div>
    <div class="col-3">
    <p style="margin-left:20px;"> {{following_count-1}} </p>
    </div>
    <div class="col-3">
    <p style="margin-left:20px;"> {{followers_count-1}} </p>
    </div>     
  </div>

<br><br>



<!--Profile Top Ends-->



    <br>
   





<!--POSTS-->



<div>
<div class="row">
 <div class="col-4 px-3 my-3 mx-auto" v-for="post1 in posts_data" style="width:24rem;">
  <div class="card" v-if="post1.archive==0">
    <img :src="'../static/post_pics/' + post1.post_picture" class="card-img-top" alt="..." height="420px">
    <div class="card-body">
      <h5 class="card-title">{{post1.title}}</h5>
       {{post1.email}} <br> {{date1(post1.timestamp)}}<br>
      <p class="card-text">{{post1.caption}}</p>
  
      <br>
      <br>
      <div class="row">
      
      <div class="col-auto">
      <button class="btn btn-primary" @click="celery_export_post(post1.email, post1.id, post1.title, post1.caption, post1.post_picture, post1.archive, post1.timestamp)">Export</button>     
      </div>



      </div>


    </div>
  </div>
 
</div>
</div>
</div>


     
</div>
    `,
    mounted:function(){
        fetch(`http://127.0.0.1:5000/api/getothersposts/${this.user_id}`).then(response=>response.json()).then(response1=>{console.log(response1)
            this.posts_data=response1.reverse()
            this.total_posts=Object.keys(response1).length})
            console.log("Posts Data",this.posts_data)  

        fetch(`http://127.0.0.1:5000/api/getspecificuserdetails/${this.user_id}`).then(response=>response.json()).then(response1=>{console.log(response1)
        this.user_data=response1})
        console.log("User Data",this.user_data)  
            
        fetch(`http://127.0.0.1:5000/api/getfollowdetails/${this.user_id}`).then(response=>response.json()).then(response1=>{console.log(response1)
        this.following_count=Object.keys(response1[0]["iamfollowing"]).length
        this.followers_count=Object.keys(response1[0]["followingme"]).length
        })

        // fetch("http://127.0.0.1:5000/api/getmyposts").then(response=>response.json()).then(response1=>{console.log(response1)
        // this.total_posts=Object.keys(response1).length})
        // console.log(this.total_posts)
    },
    data:function(){
        return{
            user_data:[],
            posts_data:[],
            following_count:0,
            followers_count:0,
            total_posts:0,
            user_id: this.$route.params.id,
            title:null,
            caption:null,
            image:null,
            total_comments:0,
            total_likes:0,
        }
    },
    components:{
        my_posts,
        navbar,
    },
    methods:{
      date1(d){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(d);
        return date.toLocaleDateString("en-US", options);
      },

        file_uploaded(event){
          this.image = event.target.files[0]
        },

        celery_export_post(email, id, title, caption, post_picture, archive, timestamp) {
          const form_data = new FormData()
            form_data.append("email", email)
            form_data.append("post_id", id)
            form_data.append("title", title)
            form_data.append("timestamp", timestamp)
            form_data.append("post_picture", post_picture)
            form_data.append("caption", caption)
          fetch('http://127.0.0.1:5000/api/celery_export_post', {
            method:"POST",
            body: form_data,
          }).then(r => r.json()
          ).then(d => {
            console.log("Celery Task Details:", d);
            let interval = setInterval(() => {
              fetch(`http://127.0.0.1:5000/api/status/${d.Task_ID}`).then(r => r.json()
              ).then(d => {
                  if (d.Task_State === "SUCCESS") {
                    console.log("task finished")
                    clearInterval(interval);
                    window.location.href = "http://127.0.0.1:5000/api/download-file";
                  }
                  else {
                    console.log("task still executing")
                  }
              })
            }, 1000)
          })
        },
    }
}