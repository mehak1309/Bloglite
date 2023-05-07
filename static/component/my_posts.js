export default {
    template:`
  <div>
  <div class="row">
   <div class="col-4 px-4 my-3 mx-auto" v-for="post1 in posts_data" style="width:26.5rem;">
    <div class="card">
      <img :src="'../static/post_pics/' + post1.post_picture" class="card-img-top" alt="..." height="420px">
      <div class="card-body">
        <h5 class="card-title">{{post1.title}}</h5>
        {{post1.email}} <br> {{date1(post1.timestamp)}}<br>
        <p class="card-text">{{post1.caption}}</p>
    
        <br>
        <br>
        <div class="row">
        <div class="col-4">
    

<button type="button" v-if="!post1.archive" class="btn btn-primary" @click="update_archive_true(post1.id)">Archive</button>
   <button type="button" v-else class="btn btn-primary" @click="update_archive_false(post1.id)">UnArchive</button>

        </div>
        
        <div class="col-3">
       
        <button class="btn btn-primary" @click="celery_export_post(post1.email, post1.id, post1.title, post1.caption, post1.post_picture, post1.archive, post1.timestamp)">Export</button>     
        </div>

        <!--EDIT BUTTON MODAL-->

<!-- Button trigger modal -->
<div class="col-2">
<button type="button" style="margin-left:-5px;" class="card-link btn btn-primary" :data-bs-target="'#staticBackdrop' + post1.id" data-bs-toggle="modal">
  Edit 
</button>
</div>

<!-- Modal -->
<div class="modal fade" :id="'staticBackdrop' + post1.id" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="'staticBackdropLabel' + post1.id" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title fs-5" :id="'staticBackdropLabel' + post1.id">Add a Post</h5>
        

        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="my-3">
        <label> Title: </label>
        <input type="text" v-model="title">
        </div>

        <div class="my-3">
        <label> Caption: </label>
        <input type="text" v-model="caption">
        </div>

        <div class="my-3">
        <label> Image: </label>
        <input type="file" class="form-control-file" id="exampleFormControlFile1" @change="file_uploaded">
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" @click="update_post(post1.id)" class="btn btn-primary" data-bs-dismiss="modal">Update</button>
      
        </div>
    </div>
  </div>
</div>



<!--EDIT BUTTON MODEL ENDS-->






<!--DELETE BUTTON MODAL-->

<!-- Button trigger modal -->
<div class="col-3">
<button type="button" class="card-link btn btn-danger" :data-bs-target="'#staticBackdrop1' + post1.id" data-bs-toggle="modal">
  Delete 
</button>
</div>

<!-- Modal -->
<div class="modal fade" :id="'staticBackdrop1' + post1.id" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="'staticBackdropLabel1' + post1.id" aria-hidden="true">  
<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
       <h5 class="modal-title fs-5" :id="'staticBackdropLabel1' + post1.id">Delete Post</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">

        <div>
        Are you sure you want to delete this post?
        </div>   

      </div>

      <div class="modal-footer">

        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" @click="delete_post(post1.id)" class="btn btn-danger" data-bs-dismiss="modal">Delete</button>
      
        </div>
    </div>
  </div>
</div>


<!--DELETE BUTTON MODEL ENDS-->


        </div>


      </div>
    </div>
   
  </div>
</div>
</div>


    `,
    mounted:function(){
      document.title = "My Posts"
      fetch("http://127.0.0.1:5000/api/getmyposts").then(response=>response.json()).then(response1=>{console.log(response1)
        this.posts_data=response1.reverse()})
        console.log(this.posts_data)
    },
    data: function(){
        return {timestamp1: "timestamp1",
        total_likes:0,
        comments1:{},
        all_comments:[],
        img1:"",
        user_comment:"",
        like_boolean: false,
        username1:"user1",
        id1: 0,
        post_text:"post_text",
        specific_user_comments:[],
        title1:"my first post",
        total_comments:0,
        posts_data: [],
        title:null,
        caption:null,
        image:null,
        }
    },
    methods:{
      date1(d){
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(d);
        return date.toLocaleDateString("en-US", options);
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

  
      file_uploaded(event){
        this.image = event.target.files[0]
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
        },
        update_post(id){
          const form_data = new FormData()
          form_data.append("title", this.title)
          form_data.append("post_picture", this.image)
          form_data.append("caption", this.caption)
          console.log(form_data["title"])         
          fetch(`http://127.0.0.1:5000/api/edit_post/${id}`, {
          method:"POST",
          body: form_data,
        }).then(response => response.json()).then(data => {
          console.log(data)

          location.reload();

        })

        },


        update_archive_false(id){
          const form_data = new FormData()
          form_data.append("archive", false)     
          fetch(`http://127.0.0.1:5000/api/update_archive/${id}`, {
          method:"POST",
          body: form_data,
        }).then(response => response.json()).then(data => {
          console.log(data)
          location.reload();


        })

        },


        update_archive_true(id){
          const form_data = new FormData()
          form_data.append("archive", true)     
          fetch(`http://127.0.0.1:5000/api/update_archive/${id}`, {
          method:"POST",
          body: form_data,
        }).then(response => response.json()).then(data => {
          console.log(data)
          location.reload();


        })

        },
        
        delete_post(id){
          fetch(`http://127.0.0.1:5000/api/deletepost/${id}`, {
            method: 'DELETE',
          }).then(response=>response.json()).then(data=>{
            fetch("/getmyposts").then(response=>response.json()).then(response1=>{console.log(response1)
              this.posts_data=response1})
              console.log(this.posts_data)

              location.reload();

          })
        },

        
    }
  }
  








