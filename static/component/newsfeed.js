import navbar from './navbar.js'

export default {
    template:`

<div>
<navbar> </navbar>
<div class="row">
  <div v-for="(post1, index) in posts_data" v-if="check_follow(post1.account) && post1.archive==0" :key="index" class="col-4 px-3 py-3 mx-auto" style="width:24rem;">
    <div class="card">
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
    `,
    mounted:function(){
      document.title = "Newsfeed"
      fetch("http://127.0.0.1:5000/api/getallposts").then(response=>response.json()).then(response1=>{console.log(response1)
        this.posts_data=response1.reverse()})
        console.log(this.posts_data)  
        

        fetch("http://127.0.0.1:5000/api/getfollowdetails/currentuser").then(response=>response.json()).then(response1=>{console.log(response1)
        let data1=[]
        for(let i=0; i< Object.keys(response1[0]['iamfollowing']).length; i++){
          data1.push(response1[0]['iamfollowing'][i]['following_id'])
        }
        this.follow_data=data1})

    },
    components:{
      navbar,
    },
    data: function(){
        return {timestamp1: "timestamp1",
        id1:0,
        like_boolean: false,
        posts_data:[],
        follow_data:[],
        }
    },
    computed:{
      
    },
    methods:{
      date1(d){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(d);
        return date.toLocaleDateString("en-US", options);
      },
      check_follow(id){
        return this.follow_data.includes(Number(id))
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

        count_likes(){
            this.like_boolean = !this.like_boolean
            if(this.like_boolean==true){
              return this.total_likes+=1;
            }
            else
              return this.total_likes-=1  
        },
    
        add_comment(user_comment){
            this.specific_user_comments.push(user_comment)
            this.all_comments.push(user_comment)
            this.comments1[this.username1]=this.specific_user_comments
            return this.comments1;
        }
    }
}

